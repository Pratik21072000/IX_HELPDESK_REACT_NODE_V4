const AWS = require("aws-sdk");

// Configure AWS SES
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_SES_REGION || process.env.AWS_REGION,
});

const ses = new AWS.SES();

// Email templates
const getTicketCreatedTemplate = (ticket, user) => {
  return {
    subject: `New Ticket Created: ${ticket.subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
          New Ticket Created
        </h2>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #007bff; margin-top: 0;">Ticket Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; font-weight: bold; width: 150px;">Ticket ID:</td>
              <td style="padding: 8px;">#${ticket.id}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Subject:</td>
              <td style="padding: 8px;">${ticket.subject}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Description:</td>
              <td style="padding: 8px;">${ticket.description}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Department:</td>
              <td style="padding: 8px;">${ticket.department}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Priority:</td>
              <td style="padding: 8px;">
                <span style="background-color: ${getPriorityColor(ticket.priority)}; color: white; padding: 2px 8px; border-radius: 3px;">
                  ${ticket.priority}
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Status:</td>
              <td style="padding: 8px;">
                <span style="background-color: ${getStatusColor(ticket.status)}; color: white; padding: 2px 8px; border-radius: 3px;">
                  ${ticket.status}
                </span>
              </td>
            </tr>
            ${
              ticket.category
                ? `
            <tr>
              <td style="padding: 8px; font-weight: bold;">Category:</td>
              <td style="padding: 8px;">${ticket.category}</td>
            </tr>`
                : ""
            }
            ${
              ticket.subcategory
                ? `
            <tr>
              <td style="padding: 8px; font-weight: bold;">Subcategory:</td>
              <td style="padding: 8px;">${ticket.subcategory}</td>
            </tr>`
                : ""
            }
            <tr>
              <td style="padding: 8px; font-weight: bold;">Created By:</td>
              <td style="padding: 8px;">${user.name} (${user.username})</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Created At:</td>
              <td style="padding: 8px;">${new Date(ticket.createdAt).toLocaleString()}</td>
            </tr>
            ${
              ticket.files && ticket.files.length > 0
                ? `
            <tr>
              <td style="padding: 8px; font-weight: bold;">Attachments:</td>
              <td style="padding: 8px;">
                ${ticket.files.map((file) => `<div>📎 ${file.originalname || file.name}</div>`).join("")}
              </td>
            </tr>`
                : ""
            }
          </table>
        </div>
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          This is an automated notification from the TicketFlow system.
        </p>
      </div>
    `,
    text: `
New Ticket Created

Ticket ID: #${ticket.id}
Subject: ${ticket.subject}
Description: ${ticket.description}
Department: ${ticket.department}
Priority: ${ticket.priority}
Status: ${ticket.status}
${ticket.category ? `Category: ${ticket.category}` : ""}
${ticket.subcategory ? `Subcategory: ${ticket.subcategory}` : ""}
Created By: ${user.name} (${user.username})
Created At: ${new Date(ticket.createdAt).toLocaleString()}
${ticket.files && ticket.files.length > 0 ? `Attachments: ${ticket.files.length} file(s)` : ""}

This is an automated notification from the TicketFlow system.
    `,
  };
};

const getTicketUpdatedTemplate = (ticket, user, oldTicket) => {
  const changes = getTicketChanges(oldTicket, ticket);

  return {
    subject: `Ticket Updated: ${ticket.subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; border-bottom: 2px solid #28a745; padding-bottom: 10px;">
          Ticket Updated
        </h2>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #28a745; margin-top: 0;">Ticket Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; font-weight: bold; width: 150px;">Ticket ID:</td>
              <td style="padding: 8px;">#${ticket.id}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Subject:</td>
              <td style="padding: 8px;">${ticket.subject}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Department:</td>
              <td style="padding: 8px;">${ticket.department}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Priority:</td>
              <td style="padding: 8px;">
                <span style="background-color: ${getPriorityColor(ticket.priority)}; color: white; padding: 2px 8px; border-radius: 3px;">
                  ${ticket.priority}
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Status:</td>
              <td style="padding: 8px;">
                <span style="background-color: ${getStatusColor(ticket.status)}; color: white; padding: 2px 8px; border-radius: 3px;">
                  ${ticket.status}
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Updated By:</td>
              <td style="padding: 8px;">${user.name} (${user.username})</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Updated At:</td>
              <td style="padding: 8px;">${new Date(ticket.updatedAt).toLocaleString()}</td>
            </tr>
          </table>
        </div>
        
        ${
          changes.length > 0
            ? `
        <div style="background-color: #fff3cd; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <h3 style="color: #856404; margin-top: 0;">Changes Made</h3>
          <ul style="margin: 0; padding-left: 20px;">
            ${changes.map((change) => `<li style="margin: 5px 0;">${change}</li>`).join("")}
          </ul>
        </div>`
            : ""
        }
        
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          This is an automated notification from the TicketFlow system.
        </p>
      </div>
    `,
    text: `
Ticket Updated

Ticket ID: #${ticket.id}
Subject: ${ticket.subject}
Department: ${ticket.department}
Priority: ${ticket.priority}
Status: ${ticket.status}
Updated By: ${user.name} (${user.username})
Updated At: ${new Date(ticket.updatedAt).toLocaleString()}

${changes.length > 0 ? `Changes Made:\n${changes.map((change) => `- ${change}`).join("\n")}` : ""}

This is an automated notification from the TicketFlow system.
    `,
  };
};

// Helper functions
const getPriorityColor = (priority) => {
  switch (priority) {
    case "HIGH":
      return "#dc3545";
    case "MEDIUM":
      return "#ffc107";
    case "LOW":
      return "#28a745";
    default:
      return "#6c757d";
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case "OPEN":
      return "#007bff";
    case "IN_PROGRESS":
      return "#ffc107";
    case "ON_HOLD":
      return "#6c757d";
    case "CANCELLED":
      return "#dc3545";
    case "CLOSED":
      return "#28a745";
    default:
      return "#6c757d";
  }
};

const getTicketChanges = (oldTicket, newTicket) => {
  const changes = [];

  if (oldTicket.status !== newTicket.status) {
    changes.push(
      `Status changed from ${oldTicket.status} to ${newTicket.status}`,
    );
  }

  if (oldTicket.priority !== newTicket.priority) {
    changes.push(
      `Priority changed from ${oldTicket.priority} to ${newTicket.priority}`,
    );
  }

  if (oldTicket.department !== newTicket.department) {
    changes.push(
      `Department changed from ${oldTicket.department} to ${newTicket.department}`,
    );
  }

  if (oldTicket.subject !== newTicket.subject) {
    changes.push(`Subject updated`);
  }

  if (oldTicket.description !== newTicket.description) {
    changes.push(`Description updated`);
  }

  if (oldTicket.comment !== newTicket.comment && newTicket.comment) {
    changes.push(`Comment added/updated`);
  }

  return changes;
};

// Get department email
const getDepartmentEmail = (department) => {
  switch (department) {
    case "ADMIN":
      return process.env.ADMIN_EMAIL;
    case "FINANCE":
      return process.env.FINANCE_EMAIL;
    case "HR":
      return process.env.HR_EMAIL;
    default:
      return process.env.ADMIN_EMAIL;
  }
};

// Send email function
const sendEmail = async (to, subject, htmlBody, textBody) => {
  try {
    // if (process.env.SEND_NOTIFICATIONS !== "true") {
    //   console.log("Email notifications disabled");
    //   return { success: true, message: "Notifications disabled" };
    // }

    const params = {
      Destination: {
        ToAddresses: Array.isArray(to) ? to : [to],
      },
      Message: {
        Body: {
          Html: { Data: htmlBody },
          Text: { Data: textBody },
        },
        Subject: { Data: subject },
      },
      Source: process.env.SES_FROM_EMAIL,
    };

    const result = await ses.sendEmail(params).promise();
    console.log("Email sent successfully:", result.MessageId);
    return { success: true, messageId: result.MessageId };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: error.message };
  }
};

// Main notification functions
const sendTicketCreatedNotification = async (ticket, user) => {
  try {
    const departmentEmail = getDepartmentEmail(ticket.department);
    const template = getTicketCreatedTemplate(ticket, user);

    const result = await sendEmail(
      departmentEmail,
      template.subject,
      template.html,
      template.text,
    );

    return result;
  } catch (error) {
    console.error("Error sending ticket created notification:", error);
    return { success: false, error: error.message };
  }
};

const sendTicketUpdatedNotification = async (ticket, user, oldTicket) => {
  try {
    const departmentEmail = getDepartmentEmail(ticket.department);
    const template = getTicketUpdatedTemplate(ticket, user, oldTicket);

    const result = await sendEmail(
      departmentEmail,
      template.subject,
      template.html,
      template.text,
    );

    return result;
  } catch (error) {
    console.error("Error sending ticket updated notification:", error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendTicketCreatedNotification,
  sendTicketUpdatedNotification,
  sendEmail,
  ses,
};
