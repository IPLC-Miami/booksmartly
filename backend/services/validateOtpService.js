const supabase = require("../config/supabaseClient");

const validateOtp = async (id , otp)=>{
    const currentTime = new Date().toISOString();
    const  {data: otpData , error: otpError} = await supabase.from('otp').select('expiration_time').eq('userId', id).eq('otp', otp);
    if (otpError) {
        return { "check": false , error: otpError.message };
    }
    for(const row of otpData){
        if(row.expiration_time > currentTime){
            return {"check": true};
        }
    }
    return {"check": false};

}

module.exports = validateOtp
