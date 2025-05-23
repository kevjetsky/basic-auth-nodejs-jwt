import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();
const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SERVICE_ID } = process.env;
const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

export const sendOPT = async (phoneNumber) => {
    const verification = await client.verify.v2.services(TWILIO_VERIFY_SERVICE_ID)
      .verifications
      .create({to: `${ phoneNumber.countryCode + phoneNumber.number }`, channel: 'sms'})

    return verification;
}

export const verifyOPT = async (phoneNumber, code) => {
    const verification = await client.verify.v2.services(TWILIO_VERIFY_SERVICE_ID)
      .verificationChecks
      .create({to: `${ phoneNumber.countryCode + phoneNumber.number }`, code: code})

    return verification;
}