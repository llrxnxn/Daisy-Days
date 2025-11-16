const transporter = require('../config/email');
const PDFDocument = require('pdfkit');
const { Readable } = require('stream');

// Generate order email HTML
const generateOrderEmailHTML = (order, user) => {
  const itemsHTML = order.items
    .map(
      (item) => `
    <tr>
      <td style="border: 1px solid #ddd; padding: 12px;">${item.productId?.name || 'Product'}</td>
      <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">${item.quantity}</td>
      <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">₱${item.price.toFixed(2)}</td>
      <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">₱${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `
    )
    .join('');

  const statusColors = {
    pending: '#FFA500',
    confirmed: '#9333EA',
    shipped: '#3B82F6',
    delivered: '#22C55E',
    cancelled: '#EF4444',
  };

  const statusColor = statusColors[order.status] || '#6B7280';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Update - Daisy Days</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f5f5f5;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 20px auto;
                background-color: #fff;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                overflow: hidden;
            }
            .header {
                background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
                color: white;
                padding: 30px;
                text-align: center;
            }
            .header h1 {
                margin: 0;
                font-size: 28px;
            }
            .header p {
                margin: 5px 0 0 0;
                opacity: 0.9;
            }
            .content {
                padding: 30px;
            }
            .section-title {
                font-size: 18px;
                font-weight: 600;
                color: #111;
                margin: 20px 0 15px 0;
                border-bottom: 2px solid #ec4899;
                padding-bottom: 10px;
            }
            .status-badge {
                display: inline-block;
                background-color: ${statusColor};
                color: white;
                padding: 10px 20px;
                border-radius: 20px;
                font-weight: 600;
                text-transform: capitalize;
                margin: 15px 0;
                font-size: 14px;
            }
            .order-info {
                background-color: #f9f9f9;
                border-left: 4px solid #ec4899;
                padding: 15px;
                margin: 15px 0;
                border-radius: 4px;
            }
            .order-info p {
                margin: 8px 0;
            }
            .info-label {
                font-weight: 600;
                color: #666;
                font-size: 13px;
            }
            .info-value {
                color: #111;
                font-size: 14px;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin: 15px 0;
            }
            table thead {
                background-color: #f3f4f6;
            }
            table th {
                border: 1px solid #ddd;
                padding: 12px;
                text-align: left;
                font-weight: 600;
                color: #333;
            }
            table td {
                border: 1px solid #ddd;
                padding: 12px;
            }
            .totals {
                background-color: #f9f9f9;
                border-top: 2px solid #ec4899;
                margin-top: 20px;
                padding-top: 20px;
            }
            .total-row {
                display: flex;
                justify-content: space-between;
                margin: 10px 0;
                padding: 8px 0;
                font-size: 14px;
            }
            .subtotal {
                color: #666;
            }
            .shipping {
                color: #666;
            }
            .grand-total {
                border-top: 2px solid #ec4899;
                padding-top: 10px;
                font-size: 18px;
                font-weight: 700;
                color: #111;
            }
            .shipping-address {
                background-color: #faf3ff;
                border-left: 4px solid #9333ea;
                padding: 15px;
                margin: 15px 0;
                border-radius: 4px;
            }
            .address-line {
                margin: 5px 0;
                color: #333;
                font-size: 14px;
            }
            .footer {
                background-color: #f3f4f6;
                color: #666;
                text-align: center;
                padding: 20px;
                font-size: 12px;
                border-top: 1px solid #ddd;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🌸 Daisy Days</h1>
                <p>Order Update Notification</p>
            </div>
            
            <div class="content">
                <p>Hi <strong>${user?.firstName || 'Customer'}</strong>,</p>
                
                <p>Thank you for your order! Here's an update on your transaction:</p>
                
                <div class="status-badge">${order.status}</div>
                
                <div class="section-title">📋 Order Details</div>
                <div class="order-info">
                    <p><span class="info-label">Order ID:</span> <span class="info-value">${order._id}</span></p>
                    <p><span class="info-label">Order Date:</span> <span class="info-value">${new Date(order.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}</span></p>
                    <p><span class="info-label">Status:</span> <span class="info-value" style="text-transform: capitalize;">${order.status}</span></p>
                </div>
                
                <div class="section-title">📦 Items Ordered</div>
                <table>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th style="text-align: center;">Quantity</th>
                            <th style="text-align: right;">Price</th>
                            <th style="text-align: right;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHTML}
                    </tbody>
                </table>
                
                <div class="totals">
                    <div class="total-row subtotal">
                        <span>Subtotal:</span>
                        <span>₱${order.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}</span>
                    </div>
                    <div class="total-row shipping">
                        <span>Shipping:</span>
                        <span>${order.totalAmount > 1000 ? 'FREE' : '₱150.00'}</span>
                    </div>
                    <div class="total-row grand-total">
                        <span>Grand Total:</span>
                        <span>₱${order.totalAmount.toFixed(2)}</span>
                    </div>
                </div>
                
                <div class="section-title">🚚 Shipping Address</div>
                <div class="shipping-address">
                    <div class="address-line"><strong>${order.shippingAddress?.firstName} ${order.shippingAddress?.lastName}</strong></div>
                    <div class="address-line">${order.shippingAddress?.email}</div>
                    <div class="address-line">${order.shippingAddress?.phone}</div>
                    <div class="address-line">${order.shippingAddress?.address}</div>
                </div>
                
                <p style="color: #666; font-size: 14px;">
                    If you have any questions about your order, please don't hesitate to contact us at support@daisydays.com
                </p>
            </div>
            
            <div class="footer">
                <p>&copy; 2025 Daisy Days. All rights reserved.</p>
                <p>This is an automated email. Please do not reply to this address.</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Generate PDF receipt
const generatePDFReceipt = async (order, user) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      bufferPages: true,
    });

    let buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });

    doc.on('error', reject);

    // Colors
    const primaryColor = '#ec4899';
    const textColor = '#1f2937';
    const lightGray = '#f3f4f6';
    const darkGray = '#6b7280';

    // Header with background
    doc.rect(0, 0, 595, 100).fill(primaryColor);
    doc.fillColor('white').fontSize(28).font('Helvetica-Bold').text('DAISY DAYS', 50, 30, { align: 'left' });
    doc.fontSize(12).text('Order Receipt', 50, 65, { align: 'left' });

    // Reset colors
    doc.fillColor(textColor);

    doc.moveDown(2.5);

    // Order Number and Date Section
    doc.fontSize(11).font('Helvetica-Bold').text('ORDER DETAILS', 50, doc.y);
    doc.fontSize(9).font('Helvetica').fillColor(darkGray);

    const orderY = doc.y + 15;
    doc.text(`Order ID:`, 50, orderY);
    doc.fillColor(textColor).fontSize(10).font('Helvetica-Bold').text(`${order._id.toString()}`, 150, orderY);

    doc.fillColor(darkGray).fontSize(9).font('Helvetica');
    doc.text(`Order Date:`, 50, orderY + 25);
    doc.fillColor(textColor).fontSize(10).font('Helvetica-Bold')
      .text(`${new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 150, orderY + 25);

    doc.fillColor(darkGray).fontSize(9).font('Helvetica');
    doc.text(`Status:`, 350, orderY);
    const statusText = order.status.charAt(0).toUpperCase() + order.status.slice(1);
    const statusColor = {
      pending: primaryColor,
      confirmed: '#9333EA',
      shipped: '#3B82F6',
      delivered: '#22C55E',
      cancelled: '#EF4444',
    }[order.status] || '#6B7280';
    doc.fillColor(statusColor).fontSize(10).font('Helvetica-Bold').text(statusText, 350, orderY + 10);

    doc.moveDown(3.5);

    // Customer Information
    doc.fillColor(textColor).fontSize(11).font('Helvetica-Bold').text('CUSTOMER INFORMATION', 50, doc.y);
    doc.moveTo(50, doc.y + 8).lineTo(545, doc.y + 8).stroke(primaryColor);

    const customerY = doc.y + 15;
    doc.fillColor(darkGray).fontSize(9).font('Helvetica').text('Name:', 50, customerY);
    doc.fillColor(textColor).font('Helvetica').text(
      `${user?.firstName || order.shippingAddress?.firstName} ${user?.lastName || order.shippingAddress?.lastName}`,
      150,
      customerY
    );

    doc.fillColor(darkGray).fontSize(9).font('Helvetica').text('Email:', 50, customerY + 20);
    doc.fillColor(textColor).font('Helvetica').text(`${user?.email || order.shippingAddress?.email}`, 150, customerY + 20);

    doc.fillColor(darkGray).fontSize(9).font('Helvetica').text('Phone:', 50, customerY + 40);
    doc.fillColor(textColor).font('Helvetica').text(`${order.shippingAddress?.phone}`, 150, customerY + 40);

    doc.moveDown(3.5);

    // Shipping Address
    doc.fillColor(textColor).fontSize(11).font('Helvetica-Bold').text('SHIPPING ADDRESS', 50, doc.y);
    doc.moveTo(50, doc.y + 8).lineTo(545, doc.y + 8).stroke(primaryColor);

    const addressY = doc.y + 15;
    doc.fillColor(textColor).fontSize(9).font('Helvetica-Bold')
      .text(`${order.shippingAddress?.firstName} ${order.shippingAddress?.lastName}`, 50, addressY);
    doc.fontSize(9).font('Helvetica').text(`${order.shippingAddress?.address}`, 50, addressY + 20);

    doc.moveDown(2.5);

    // Items Table Header
    doc.fillColor(textColor).fontSize(11).font('Helvetica-Bold').text('ORDER ITEMS', 50, doc.y);
    doc.moveTo(50, doc.y + 8).lineTo(545, doc.y + 8).stroke(primaryColor);

    const tableStartY = doc.y + 15;

    // Table header background
    doc.rect(50, tableStartY, 495, 25).fill(lightGray);

    // Table headers
    doc.fillColor(textColor).fontSize(9).font('Helvetica-Bold');
    doc.text('Product', 60, tableStartY + 6, { width: 250 });
    doc.text('Qty', 320, tableStartY + 6, { width: 50, align: 'center' });
    doc.text('Price', 380, tableStartY + 6, { width: 70, align: 'right' });
    doc.text('Total', 460, tableStartY + 6, { width: 75, align: 'right' });

    // Table rows
    let tableY = tableStartY + 30;
    doc.fontSize(9).font('Helvetica').fillColor(textColor);

    order.items.forEach((item, index) => {
      const itemTotal = (item.price * item.quantity).toFixed(2);

      // Alternate row background
      if (index % 2 === 0) {
        doc.rect(50, tableY - 5, 495, 20).fill(lightGray).fillColor(textColor);
      }

      doc.text(item.productId?.name || 'Product', 60, tableY, { width: 250 });
      doc.text(item.quantity.toString(), 320, tableY, { width: 50, align: 'center' });
      doc.text(`₱${item.price.toFixed(2)}`, 380, tableY, { width: 70, align: 'right' });
      doc.text(`₱${itemTotal}`, 460, tableY, { width: 75, align: 'right' });

      tableY += 25;
    });

    // Total line
    doc.moveTo(50, tableY).lineTo(545, tableY).stroke(primaryColor);
    tableY += 15;

    // Subtotal and Totals
    const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = order.totalAmount > 1000 ? 0 : 150;

    doc.fontSize(9).font('Helvetica').fillColor(darkGray);
    doc.text('Subtotal:', 380, tableY, { width: 70, align: 'right' });
    doc.fillColor(textColor).text(`₱${subtotal.toFixed(2)}`, 460, tableY, { width: 75, align: 'right' });

    tableY += 20;
    doc.fillColor(darkGray).text('Shipping:', 380, tableY, { width: 70, align: 'right' });
    doc.fillColor(textColor).text(shipping === 0 ? 'FREE' : `₱${shipping.toFixed(2)}`, 460, tableY, { width: 75, align: 'right' });

    tableY += 25;
    doc.moveTo(380, tableY - 10).lineTo(545, tableY - 10).stroke(primaryColor);

    // Grand Total
    doc.fillColor(textColor).fontSize(12).font('Helvetica-Bold');
    doc.text('TOTAL:', 380, tableY, { width: 70, align: 'right' });
    doc.fontSize(14).fillColor(primaryColor);
    doc.text(`₱${order.totalAmount.toFixed(2)}`, 460, tableY - 2, { width: 75, align: 'right' });

    // Footer
    doc.moveDown(3);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#e5e7eb');
    doc.moveDown(1);

    doc.fontSize(8).font('Helvetica').fillColor(darkGray).text(
      'Thank you for your purchase at Daisy Days!',
      50,
      doc.y,
      { align: 'center' }
    );
    doc.text('For inquiries, contact: support@daisydays.com', 50, doc.y, { align: 'center' });
    doc.text(`Receipt Generated: ${new Date().toLocaleDateString('en-US')} at ${new Date().toLocaleTimeString('en-US')}`, 50, doc.y, {
      align: 'center',
    });

    doc.end();
  });
};

// Send order confirmation email with PDF receipt
const sendOrderConfirmationEmail = async (order, user) => {
  try {
    // Generate PDF receipt
    const pdfBuffer = await generatePDFReceipt(order, user);

    const mailOptions = {
      from: '"Daisy Days" <orders@daisydays.com>',
      to: user.email || order.shippingAddress?.email,
      subject: `Order Confirmed - #${order._id}`,
      html: generateOrderEmailHTML(order, user),
      attachments: [
        {
          filename: `Receipt-${order._id}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent with PDF receipt:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    throw error;
  }
};

// Send order status update email with PDF receipt (only for delivered status)
const sendOrderStatusUpdateEmail = async (order, user, previousStatus) => {
  try {
    const mailOptions = {
      from: '"Daisy Days" <orders@daisydays.com>',
      to: user.email || order.shippingAddress?.email,
      subject: `Order Status Updated - #${order._id} is now ${order.status}`,
      html: generateOrderEmailHTML(order, user),
    };

    // Attach PDF receipt only when order is delivered
    if (order.status === 'delivered') {
      const pdfBuffer = await generatePDFReceipt(order, user);
      mailOptions.attachments = [
        {
          filename: `Receipt-${order._id}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ];
    }

    const info = await transporter.sendMail(mailOptions);
    console.log('Order status update email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending order status update email:', error);
    throw error;
  }
};

module.exports = {
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail,
  generateOrderEmailHTML,
  generatePDFReceipt,
};
