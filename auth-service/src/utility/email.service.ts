import nodemailer from 'nodemailer';



export const sendEmail = async (to: string, subject: string, body: string) => {
    const transporter = nodemailer.createTransport({
        host: "localhost",
        port: 1025,
        ignoreTLS: true,
        secure: false,
    });

    await transporter.sendMail({
        from: "noreply@myapp.com",
        to,
        subject,
        text: body,
    });

    console.log("Email sent successfully");
};	
        
