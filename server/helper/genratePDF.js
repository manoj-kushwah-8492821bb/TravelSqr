const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

exports.generateTicketPDF = async (booking, user, departureDetails, arrivalDetails) => {
  return new Promise((resolve, reject) => {
    try {
      const pdfPath = path.join(__dirname, `../tickets/Ticket_${booking._id}.pdf`);
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const writeStream = fs.createWriteStream(pdfPath);
      doc.pipe(writeStream);

      // Header with Airline Branding
      doc.fontSize(22).text("IndiGo", { align: "left", bold: true });
      doc.fontSize(10).text(`Date of Booking: ${new Date(booking.booking_date_time).toLocaleString()}`, { align: "right" });
      doc.moveDown(2);

      // Booking & Payment Details
      doc.fontSize(14).text(`PNR/Booking Ref: ${booking._id}`, { continued: true }).fillColor("green").text("  Confirmed");
      doc.fillColor("black").text(`Payment Status: ${booking.payment_status}`, { bold: true });
      doc.moveDown();

      // Flight Details Box
      doc.rect(50, doc.y, 500, 80).stroke();
      doc.moveDown();
      doc.text(`✈ Departing Flight: ${departureDetails.fullName} (${departureDetails.country})`, { bold: true });
      doc.text(`➡ Arrival: ${arrivalDetails.fullName} (${arrivalDetails.country})`);
      doc.text(`Departure Date: ${new Date(booking.depart_date).toLocaleString()}`);
      doc.moveDown();

      // Passenger Information
      doc.fontSize(14).text("Passenger Information", { underline: true });
      doc.text(`Name: ${user.first_name} ${user.last_name}`);
      doc.text(`Email: ${user.email}`);
      doc.text(`Seat: ${booking.passengers_info[0]?.seat_number || "Not Assigned"}`);
      doc.moveDown();

      // Loyalty & Rewards
      doc.fontSize(14).text("Loyalty & Rewards", { underline: true });
      doc.text(`Coins Earned: ${booking.getingCoinsPerBooking}`);
      doc.text(`Coins Used: ${booking.usedCoinsPerBooking}`);
      doc.moveDown();

      // Footer Message
      doc.text("Thank you for choosing our airline!", { align: "center", italic: true });

      // Finish PDF
      doc.end();
      writeStream.on("finish", () => resolve(pdfPath));
      writeStream.on("error", (err) => reject(err));
    } catch (error) {
      reject(error);
    }
  });
};
