const crypto = require('crypto');
const Appointment = require('../modals/appointment');

function generateRandomNumber(digits) {
    const byteCount = Math.ceil(digits / 2);
    const buffer = crypto.randomBytes(byteCount);
    const hexString = buffer.toString('hex');
    const randomNumber = parseInt(hexString, 16);
    const truncatedNumber = randomNumber % Math.pow(10, digits);
    return truncatedNumber.toString().padStart(digits, '0');
}

const returnRef = async () => {
    while (true) {
        const ref = `REF-${generateRandomNumber(6)}`;
        try {
            const checkRef = await Appointment.findOne({ ref });
            if (!checkRef) {
                return ref;
            }
        } catch (error) {
            return ref
        }
    }
}

module.exports = {
    returnRef,
    generateRandomNumber
}