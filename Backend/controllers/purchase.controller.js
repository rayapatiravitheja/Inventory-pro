import { Purchase } from "../models/purchase.model.js";
import { PurchaseDetail } from "../models/purchase-detail.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import purchaseService from "../services/purchase.service.js";
import transporter from "../utils/nodemailer.js";
import {
    getPurchaseReceiptEmailTemplate,
    getPurchaseStatusUpdateEmailTemplate,
} from "../utils/emailTemplates.js";
import { getAdminEmails } from "../utils/adminHelper.js";

const createPurchase = asyncHandler(async (req, res, next) => {
    try {
        const purchase = await purchaseService.createPurchase(
            req.body,
            req.user._id
        );
        if (purchase?._id) {
            sendPurchaseCreationNotification(purchase._id);
        }
        return res
            .status(201)
            .json(
                new ApiResponse(201, purchase, "Purchase created successfully")
            );
    } catch (err) {
        return next(err);
    }
});

const getAllPurchases = asyncHandler(async (req, res, next) => {
    try {
        const purchases =
            req.user.role === "admin"
                ? await Purchase.getAllPurchases()
                : await Purchase.find({ created_by: req.user._id })
                      .populate("supplier_id", "name shopname")
                      .populate("created_by", "username")
                      .populate("warehouse_id", "warehouse_name warehouse_code")
                      .sort({ createdAt: -1 });

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    purchases,
                    "Purchases fetched successfully"
                )
            );
    } catch (err) {
        return next(new ApiError(500, err.message));
    }
});

const getPurchaseDetails = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    try {
        const purchase = await Purchase.findById(id);

        if (!purchase) {
            return next(new ApiError(404, "Purchase not found"));
        }

        if (
            req.user.role !== "admin" &&
            !purchase.created_by.equals(req.user._id)
        ) {
            return next(
                new ApiError(
                    403,
                    "You don't have permission to view this purchase"
                )
            );
        }

        const details = await PurchaseDetail.getDetailsByPurchaseId(id);

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    details,
                    "Purchase details fetched successfully"
                )
            );
    } catch (err) {
        return next(new ApiError(500, err.message));
    }
});

const updatePurchaseStatus = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { purchase_status } = req.body;

    if (!purchase_status) {
        return next(new ApiError(400, "Purchase status is required"));
    }

    try {
        const existingPurchase = await Purchase.findById(id).select("purchase_status");
        const oldStatus = existingPurchase ? existingPurchase.purchase_status : "pending";

        const result = await purchaseService.updatePurchaseStatus(
            id,
            purchase_status,
            req.user._id,
            req.user.role
        );

        // Asynchronously notify admins & relevant stakeholders of status transition
        sendPurchaseStatusNotification(id, oldStatus, purchase_status);

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    result,
                    `Purchase status updated to ${purchase_status} successfully`
                )
            );
    } catch (err) {
        return next(err);
    }
});

const getReturnPreview = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    try {
        const purchase = await Purchase.findById(id);

        if (!purchase) {
            return next(new ApiError(404, "Purchase not found"));
        }

        if (
            req.user.role !== "admin" &&
            !purchase.created_by.equals(req.user._id)
        ) {
            return next(
                new ApiError(
                    403,
                    "You don't have permission to view this purchase"
                )
            );
        }

        if (purchase.purchase_status === "returned") {
            return next(new ApiError(400, "Purchase is already returned"));
        }

        if (purchase.purchase_status !== "completed") {
            return next(
                new ApiError(400, "Only completed purchases can be returned")
            );
        }

        const purchaseDetails = await PurchaseDetail.find({
            purchase_id: id,
        }).populate("product_id", "product_name stock");

        let totalPotentialRefund = 0;

        const returnPreview = purchaseDetails.map((detail) => {
            const product = detail.product_id;
            const returnableQuantity = Math.min(detail.quantity, product.stock);
            const refundAmount = returnableQuantity * detail.unitcost;
            totalPotentialRefund += refundAmount;

            return {
                product_id: product._id,
                product_name: product.product_name,
                purchased_quantity: detail.quantity,
                current_stock: product.stock,
                returnable_quantity: returnableQuantity,
                unit_cost: detail.unitcost,
                potential_refund: refundAmount,
                can_fully_return: returnableQuantity === detail.quantity,
            };
        });

        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    purchase_id: id,
                    purchase_no: purchase.purchase_no,
                    total_potential_refund: totalPotentialRefund,
                    return_preview: returnPreview,
                },
                "Return preview generated successfully"
            )
        );
    } catch (err) {
        return next(new ApiError(500, err.message));
    }
});

// Helper: send purchase creation notification email to Admins & Supplier
const sendPurchaseCreationNotification = async (purchaseId) => {
    try {
        const purchase = await Purchase.findById(purchaseId)
            .populate("supplier_id", "name shopname email phone")
            .populate("warehouse_id", "warehouse_name warehouse_code")
            .populate("created_by", "username name email");

        if (!purchase) return;

        const details = await PurchaseDetail.find({ purchase_id: purchaseId }).populate(
            "product_id",
            "product_name product_code unitcost"
        );

        let totalAmount = 0;
        const items = details.map((d) => {
            const itemTotal = Number(d.quantity || 1) * Number(d.unitcost || 0);
            totalAmount += itemTotal;
            return {
                product_name: d.product_id?.product_name || "Procured Item",
                product_code: d.product_id?.product_code || "—",
                quantity: d.quantity,
                unitcost: d.unitcost,
                total: itemTotal,
            };
        });

        const template = getPurchaseReceiptEmailTemplate({
            purchase_no: purchase.purchase_no,
            supplier_name: purchase.supplier_id?.name || purchase.supplier_id?.shopname || "Supplier",
            warehouse_name: purchase.warehouse_id?.warehouse_name || "Main Warehouse",
            purchase_status: purchase.purchase_status,
            total_amount: totalAmount,
            items,
            creator_name: purchase.created_by?.username || purchase.created_by?.name || "Procurement Admin",
            adminPortalUrl: `${process.env.FRONTEND_URL || "http://localhost:5173"}/purchases`,
        });

        const adminEmails = await getAdminEmails();
        for (const adminTo of adminEmails) {
            try {
                await transporter.sendMail({
                    from: `"InventoryPro Procurement" <${process.env.SENDER_EMAIL || process.env.EMAIL_USER || "onboarding@resend.dev"}>`,
                    to: adminTo,
                    ...template,
                });
                console.log(`📧 Admin purchase alert sent to ${adminTo} for PO #${purchase.purchase_no}`);
            } catch (oneAdminErr) {
                console.warn(`⚠️ Failed sending purchase alert to ${adminTo}:`, oneAdminErr.message);
            }
        }

        // Also notify supplier if an email address exists
        if (purchase.supplier_id?.email && purchase.supplier_id.email.includes("@")) {
            try {
                await transporter.sendMail({
                    from: `"InventoryPro Procurement" <${process.env.SENDER_EMAIL || process.env.EMAIL_USER || "onboarding@resend.dev"}>`,
                    to: purchase.supplier_id.email,
                    ...template,
                });
                console.log(`📧 Supplier purchase copy sent to ${purchase.supplier_id.email} for PO #${purchase.purchase_no}`);
            } catch (supErr) {
                console.warn(`⚠️ Failed sending purchase copy to supplier:`, supErr.message);
            }
        }
    } catch (err) {
        console.warn("⚠️ Failed to send purchase creation notification:", err.message);
    }
};

// Helper: send purchase status update notification to Admins
const sendPurchaseStatusNotification = async (purchaseId, oldStatus, newStatus) => {
    try {
        const purchase = await Purchase.findById(purchaseId)
            .populate("supplier_id", "name shopname email")
            .populate("warehouse_id", "warehouse_name");

        if (!purchase) return;

        const details = await PurchaseDetail.find({ purchase_id: purchaseId });
        const totalAmount = details.reduce(
            (sum, d) => sum + Number(d.quantity || 1) * Number(d.unitcost || 0),
            0
        );

        const template = getPurchaseStatusUpdateEmailTemplate({
            purchase_no: purchase.purchase_no,
            supplier_name: purchase.supplier_id?.name || purchase.supplier_id?.shopname || "Supplier",
            warehouse_name: purchase.warehouse_id?.warehouse_name || "Main Warehouse",
            old_status: oldStatus,
            new_status: newStatus,
            total_amount: totalAmount,
            adminPortalUrl: `${process.env.FRONTEND_URL || "http://localhost:5173"}/purchases`,
        });

        const adminEmails = await getAdminEmails();
        for (const adminTo of adminEmails) {
            try {
                await transporter.sendMail({
                    from: `"InventoryPro Procurement" <${process.env.SENDER_EMAIL || process.env.EMAIL_USER || "onboarding@resend.dev"}>`,
                    to: adminTo,
                    ...template,
                });
                console.log(`📧 Admin purchase status update sent to ${adminTo} for PO #${purchase.purchase_no}`);
            } catch (oneAdminErr) {
                console.warn(`⚠️ Failed sending purchase status update to ${adminTo}:`, oneAdminErr.message);
            }
        }
    } catch (err) {
        console.warn("⚠️ Failed to send purchase status notification:", err.message);
    }
};

export {
    createPurchase,
    getAllPurchases,
    getPurchaseDetails,
    updatePurchaseStatus,
    getReturnPreview,
    sendPurchaseCreationNotification,
    sendPurchaseStatusNotification,
};
