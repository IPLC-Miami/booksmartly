const sendEmail = require("./emailService"); 
const supabase = require("../config/supabaseClient"); 

const sendReminder = async ()=>{
    const date = new Date();
    //tomorrows date in yyyy-mm-dd format
    const tomorrow = new Date(date.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const {data: appointments, error} = await supabase.from('appointments').select('*').eq('appointment_date', tomorrow);
    if (error) {
        return { error: error.message };
    }
    for(const appointment of appointments){
        const {data: patientData, error: patientError} = await supabase.from('profiles').select('email').eq('id', appointment.patient_id).single();
        if (patientError) {
            return { error: patientError.message };
        }
        const email = patientData.email;
        sendEmail(email, "Appointment Reminder", `Hello, Your appointment is scheduled for tomorrow. Please be on time.`);
    }
    return {data: "Reminders sent successfully"};
}

module.exports = sendReminder;

