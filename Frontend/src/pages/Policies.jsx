import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Tabs, Card, Typography, Divider, Button, Tag } from "antd";
import {
    FileProtectOutlined,
    LockOutlined,
    CarOutlined,
    RollbackOutlined,
    PhoneOutlined,
    ArrowLeftOutlined,
    SafetyCertificateOutlined,
    CheckCircleFilled,
} from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;

const Policies = () => {
    const location = useLocation();

    // Map path to tab key
    const getActiveKey = (path) => {
        if (path.includes("privacy")) return "privacy";
        if (path.includes("shipping")) return "shipping";
        if (path.includes("cancellation") || path.includes("refund")) return "refund";
        if (path.includes("contact")) return "contact";
        return "terms";
    };

    const [activeTab, setActiveTab] = useState(getActiveKey(location.pathname));

    useEffect(() => {
        setActiveTab(getActiveKey(location.pathname));
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [location.pathname]);

    const tabItems = [
        {
            key: "terms",
            label: (
                <span className="flex items-center gap-2">
                    <FileProtectOutlined />
                    Terms & Conditions
                </span>
            ),
            children: (
                <div className="space-y-6 text-slate-700">
                    <div>
                        <Title level={3} className="text-slate-900 font-bold mb-2">
                            Terms & Conditions
                        </Title>
                        <Text type="secondary" className="text-xs">
                            Last Updated: November 2026 • Effective Immediately
                        </Text>
                    </div>

                    <Paragraph>
                        Welcome to <strong>InventoryPro</strong> ("Company", "we", "our", "us"). By accessing or using our website, buyer storefront (<code>/customer/catalog</code>), and enterprise inventory management platform, you agree to comply with and be bound by the following terms and conditions.
                    </Paragraph>

                    <Title level={4} className="text-slate-900">1. Account Registration & User Security</Title>
                    <Paragraph>
                        Customers and business operators must provide accurate, current, and complete registration details. You are responsible for safeguarding your password and multi-factor verification OTPs. InventoryPro utilizes encrypted JWT sessions and bcrypt password hashing to ensure strict identity isolation.
                    </Paragraph>

                    <Title level={4} className="text-slate-900">2. Commercial Transactions & Pricing</Title>
                    <Paragraph>
                        All product prices are quoted in Indian National Rupees (INR) and are subject to applicable Goods and Services Tax (GST 18%). Prices and inventory quantities shown on the storefront are dynamically validated server-side against our master database. In the event of pricing discrepancies due to typographical errors, we reserve the right to rectify order totals or cancel erroneous transactions with immediate refund issuance.
                    </Paragraph>

                    <Title level={4} className="text-slate-900">3. Payment Terms</Title>
                    <Paragraph>
                        Online payments are securely processed by <strong>Razorpay Software Private Limited</strong>. By selecting Razorpay, you authorize the collection of payment via UPI, Credit/Debit cards, Net Banking, or supported digital wallets. We do not store sensitive payment card details or CVVs on our servers.
                    </Paragraph>

                    <Title level={4} className="text-slate-900">4. Intellectual Property</Title>
                    <Paragraph>
                        All software, design elements, graphics, APIs, and documentation are the exclusive intellectual property of InventoryPro and Ravi Theja Rayapati. Unauthorized reproduction or commercial distribution without written consent is strictly prohibited.
                    </Paragraph>

                    <Title level={4} className="text-slate-900">5. Governing Law & Jurisdiction</Title>
                    <Paragraph>
                        These terms shall be governed by and construed in accordance with the laws of India. Any legal disputes arising out of the use of this service shall be subject to the exclusive jurisdiction of the courts of Andhra Pradesh / India.
                    </Paragraph>
                </div>
            ),
        },
        {
            key: "privacy",
            label: (
                <span className="flex items-center gap-2">
                    <LockOutlined />
                    Privacy Policy
                </span>
            ),
            children: (
                <div className="space-y-6 text-slate-700">
                    <div>
                        <Title level={3} className="text-slate-900 font-bold mb-2">
                            Privacy Policy
                        </Title>
                        <Text type="secondary" className="text-xs">
                            Compliance with Digital Personal Data Protection Act (DPDP)
                        </Text>
                    </div>

                    <Paragraph>
                        At <strong>InventoryPro</strong>, we are committed to respecting your personal privacy and safeguarding your account data. This Privacy Policy outlines what information we collect, how it is used, and the measures we employ to secure it.
                    </Paragraph>

                    <Title level={4} className="text-slate-900">1. Information We Collect</Title>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Account Details:</strong> Full name, username, email address, and encrypted passwords.</li>
                        <li><strong>Delivery Information:</strong> Shipping street addresses, state, city, and 6-digit postal PIN codes.</li>
                        <li><strong>Transaction Records:</strong> Razorpay payment identifiers, invoice reference numbers, order details, and return history.</li>
                        <li><strong>Technical Data:</strong> Browser user agent, IP address for authentication session security, and access timestamps.</li>
                    </ul>

                    <Title level={4} className="text-slate-900">2. How We Use Your Information</Title>
                    <Paragraph>
                        Your personal data is strictly utilized to fulfill e-commerce orders, dispatch regional warehouse shipments, process authorized refunds, issue GST tax invoices, and transmit automated order status emails via verified HTTPS email gateways. We do not sell, rent, or monetize personal user data to third-party marketing brokers.
                    </Paragraph>

                    <Title level={4} className="text-slate-900">3. Data Security & Cryptographic Standards</Title>
                    <Paragraph>
                        All user authentication passwords undergo cryptographic salting and hashing using <code>bcryptjs</code> (cost factor 10). Payment processing conforms to strict PCI-DSS Level 1 compliance governed by Razorpay, with all API transmissions encrypted via TLS 1.3 / HTTPS (Port 443).
                    </Paragraph>

                    <Title level={4} className="text-slate-900">4. Cookies & Session Storage</Title>
                    <Paragraph>
                        We use secure, HTTP-only cookies and local web storage strictly for managing authentication tokens, shopping cart persistence, and role-based permissions.
                    </Paragraph>
                </div>
            ),
        },
        {
            key: "shipping",
            label: (
                <span className="flex items-center gap-2">
                    <CarOutlined />
                    Shipping & Delivery Policy
                </span>
            ),
            children: (
                <div className="space-y-6 text-slate-700">
                    <div>
                        <Title level={3} className="text-slate-900 font-bold mb-2">
                            Shipping & Delivery Policy
                        </Title>
                        <Text type="secondary" className="text-xs">
                            Direct Regional Warehouse Fulfillment Network
                        </Text>
                    </div>

                    <Paragraph>
                        InventoryPro operates a distributed multi-facility fulfillment network across regional warehouse hubs. Orders placed on the storefront are allocated to the nearest regional facility with available inventory to guarantee rapid transit.
                    </Paragraph>

                    <Title level={4} className="text-slate-900">1. Shipping Timeline & Delivery Windows</Title>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Order Processing Time:</strong> Orders are verified and packaged within <strong>24 to 48 hours</strong> of payment confirmation.</li>
                        <li><strong>Standard Metro Delivery:</strong> <strong>2 to 4 business days</strong> across primary commercial centers.</li>
                        <li><strong>Regional & Non-Metro Delivery:</strong> <strong>4 to 7 business days</strong> depending on geographical postal PIN coverage.</li>
                    </ul>

                    <Title level={4} className="text-slate-900">2. Shipping Charges</Title>
                    <Paragraph>
                        Standard shipping charges are calculated during checkout based on order weight and destination. We offer free standard shipping on promotional orders exceeding qualifying thresholds.
                    </Paragraph>

                    <Title level={4} className="text-slate-900">3. Tracking & Order Updates</Title>
                    <Paragraph>
                        Once your order is dispatched from our fulfillment facility, a real-time status update is recorded in your customer dashboard under <strong>My Orders</strong>, and an automated shipment notification containing the dispatch reference is transmitted to your registered email address.
                    </Paragraph>

                    <Title level={4} className="text-slate-900">4. Undelivered Shipments</Title>
                    <Paragraph>
                        In the event of failed delivery attempts resulting from incorrect shipping addresses or unavailability of the recipient, our courier partners will attempt delivery up to three times before returning the consignment to the originating regional warehouse.
                    </Paragraph>
                </div>
            ),
        },
        {
            key: "refund",
            label: (
                <span className="flex items-center gap-2">
                    <RollbackOutlined />
                    Cancellation & Refund Policy
                </span>
            ),
            children: (
                <div className="space-y-6 text-slate-700">
                    <div>
                        <Title level={3} className="text-slate-900 font-bold mb-2">
                            Cancellation & Refund Policy
                        </Title>
                        <Text type="secondary" className="text-xs">
                            Hassle-Free 7-Day Return Window & Automated Razorpay Refunds
                        </Text>
                    </div>

                    <Paragraph>
                        At InventoryPro, customer satisfaction is paramount. We provide a transparent, automated return and refund workflow (RMA) directly integrated with our financial payment gateway.
                    </Paragraph>

                    <Title level={4} className="text-slate-900">1. 7-Day Customer Return Window (RMA)</Title>
                    <Paragraph>
                        Customers may initiate a return request within <strong>7 calendar days</strong> from the date of confirmed order delivery. Returns can be submitted directly from the <strong>Return Requests</strong> portal (<code>/customer/returns</code>).
                    </Paragraph>

                    <Title level={4} className="text-slate-900">2. Eligible Return Reasons</Title>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Defective or malfunctioning product received.</li>
                        <li>Consignment damaged during transit.</li>
                        <li>Incorrect item delivered differing from invoice specifications.</li>
                        <li>Size, dimension, or fit incompatibility.</li>
                    </ul>

                    <Title level={4} className="text-slate-900">3. Automated Refund Processing</Title>
                    <Paragraph>
                        Upon administrative review and approval of the return request:
                    </Paragraph>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 my-3 text-emerald-900 text-sm">
                        <CheckCircleFilled className="text-emerald-600 mr-2" />
                        <strong>Automated Gateway Refund:</strong> For online orders paid via Razorpay (UPI, Debit/Credit Card, NetBanking), our backend automatically invokes the <code>Razorpay Refund API</code> upon approval. The refund amount is credited directly back to the original source payment method within <strong>5 to 7 business days</strong> as per banking network standards.
                    </div>

                    <Title level={4} className="text-slate-900">4. Order Cancellation</Title>
                    <Paragraph>
                        Customers may cancel an order free of charge prior to warehouse packaging and dispatch (while order status remains <code>pending</code> or <code>processing</code>). Once an order has reached <code>shipped</code> status, standard return procedures apply upon delivery.
                    </Paragraph>
                </div>
            ),
        },
        {
            key: "contact",
            label: (
                <span className="flex items-center gap-2">
                    <PhoneOutlined />
                    Contact & Grievance
                </span>
            ),
            children: (
                <div className="space-y-6 text-slate-700">
                    <div>
                        <Title level={3} className="text-slate-900 font-bold mb-2">
                            Contact Us & Grievance Officer
                        </Title>
                        <Text type="secondary" className="text-xs">
                            Direct Support & Registered Business Credentials
                        </Text>
                    </div>

                    <Paragraph>
                        If you have questions regarding an order, payment processing, warehouse fulfillment, or compliance, please reach out to our dedicated support team:
                    </Paragraph>

                    <Card className="bg-slate-50 border border-slate-200 rounded-2xl shadow-xs">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                            <div>
                                <Text strong className="text-slate-900 block mb-1">Company / Platform</Text>
                                <p className="text-slate-600 m-0">InventoryPro Enterprise IMS & Storefront</p>
                            </div>
                            <div>
                                <Text strong className="text-slate-900 block mb-1">Owner & Grievance Officer</Text>
                                <p className="text-slate-600 m-0">Ravi Theja Rayapati</p>
                            </div>
                            <div>
                                <Text strong className="text-slate-900 block mb-1">Official Support Email</Text>
                                <a href="mailto:rayapatiravitheja@gmail.com" className="text-indigo-600 font-medium">
                                    rayapatiravitheja@gmail.com
                                </a>
                            </div>
                            <div>
                                <Text strong className="text-slate-900 block mb-1">Support Contact Number</Text>
                                <p className="text-slate-600 m-0">+91 99230 04099 / Support Desk</p>
                            </div>
                            <div className="md:col-span-2">
                                <Text strong className="text-slate-900 block mb-1">Registered Operational Address</Text>
                                <p className="text-slate-600 m-0">
                                    InventoryPro Logistics Center, KL University Road, Vaddeswaram, Guntur, Andhra Pradesh — 522502, India.
                                </p>
                            </div>
                            <div className="md:col-span-2">
                                <Text strong className="text-slate-900 block mb-1">Operational Hours</Text>
                                <p className="text-slate-600 m-0">
                                    Monday to Saturday: 9:00 AM – 6:00 PM IST (Online ticket & email monitoring 24/7)
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Back to Storefront Button */}
                <div className="mb-6 flex items-center justify-between">
                    <Link
                        to="/customer/catalog"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
                    >
                        <ArrowLeftOutlined />
                        <span>Back to Storefront</span>
                    </Link>
                    <Tag color="blue" icon={<SafetyCertificateOutlined />} className="px-3 py-1 text-xs font-semibold rounded-lg">
                        Razorpay & RBI Compliant
                    </Tag>
                </div>

                {/* Main Policy Card Container */}
                <Card className="rounded-3xl shadow-sm border border-slate-200 overflow-hidden p-2 sm:p-6 bg-white">
                    <Tabs
                        activeKey={activeTab}
                        onChange={(key) => setActiveTab(key)}
                        items={tabItems}
                        tabBarStyle={{ marginBottom: 28 }}
                        size="large"
                    />
                </Card>
            </div>
        </div>
    );
};

export default Policies;

