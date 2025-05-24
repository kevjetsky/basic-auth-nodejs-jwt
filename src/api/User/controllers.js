import User from './model';
import { v4 as uuid } from'uuid'; 
import { signToken } from '../../utils/jwt';
import { sendOPT, verifyOPT } from '../../utils/twilio';

export default {
    login: async (req, res) => {
        const { phoneNumber } = req.body;

        try {
            const { status } = await sendOPT(phoneNumber);

            if(status === 'pending'){
                const user = await User.findOne({ "phoneNumber.number": phoneNumber.number });

                if(!user){
                    const newUser = new User({
                        phoneNumber,
                        uniqueId: uuid()
                    });

                    await newUser.save();

                    const token = signToken(newUser.uniqueId);

                    return res.status(200).json({
                        token
                    });
                } else {
                    const token = signToken(user.uniqueId);

                    return res.status(200).json({
                        token
                    });
                }
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Something went wrong, try again." });
        }
    },

    getUser: async (req, res) => {
        const { sub: uniqueId } = req.user;

        const user = await User.findOne({ uniqueId });

        if(!user) return res.status(404).json({ message: "Wrong credentials" });

        return res.status(201).json(user);
    },

    updateUsername: async (req, res) => {
        const { sub: uniqueId } = req.user;
        const { username } = req.body;
    
        try {
            const user = await User.findOneAndUpdate({ uniqueId }, { username: username?.trim() || "" });
    
            if (!user) {
                return res.status(404).json({ message: "User not found." });
            }
    
            return res.status(200).json({ message: "Username updated successfully." });
        } catch (error) {
            return res.status(500).json({ message: "Something went wrong, try again." });
        }
    },

    deleteUser: async (req, res) => {
        const { sub: uniqueId } = req.user;
        
        await User.findOneAndDelete({ uniqueId });

        return res.status(200).json({ msg: "User deleted successfully" });
    },

    resendOtp: async (req, res) => {
        const { phoneNumber } = req.body;
    
        try {
            const { status } = await sendOPT(phoneNumber);
    
            if (status === 'pending') {
                return res.status(200).json({ message: "OTP code resent successfully." });
            } else {
                return res.status(400).json({ message: "Failed to send OTP. Try again later." });
            }
        } catch (error) {
            return res.status(500).json({ message: "Something went wrong, try again." });
        }
    },

    userVerification: async (req, res) => {
        const { phoneNumber, code } = req.body;

        const { status } = await verifyOPT(phoneNumber, code);

        if(status === 'approved'){
            const user = await User.findOne({ "phoneNumber.number": phoneNumber.number });

            if(!user) return res.status(404).json({ message: "User not found" });

            return res.status(200).json({
                success: true,
            });
        } else {
            return res.status(401).json({
                success: false
            });
        }
    },

    pressHeart: async (req, res) => {
        const { sub: uniqueId } = req.user;
    
        try {
            const user = await User.findOne({ uniqueId });
    
            if (!user) return res.status(404).json({ message: "User not found." });
    
            if (!user.partnerId) return res.status(400).json({ message: "You must link with a partner to use the heart." });
    
            const partner = await User.findOne({ uniqueId: user.partnerId });
    
            if (!partner) return res.status(404).json({ message: "Partner not found." });
    
            user.sentCount += 1;
            partner.receivedCount += 1;
    
            await user.save();
            await partner.save();
    
            // Optionally emit a real-time update via Socket.IO
            // io.to(partner.uniqueId).emit('updateCounts', { receivedCount: partner.receivedCount });
    
            return res.status(200).json({ message: "Heart pressed successfully." });
        } catch (error) {
            return res.status(500).json({ message: "Something went wrong, try again." });
        }
    },

    getHeartCounts: async (req, res) => {
        const { sub: uniqueId } = req.user;
    
        try {
            const user = await User.findOne({ uniqueId });
    
            if (!user) {
                return res.status(404).json({ message: "User not found." });
            }
    
            return res.status(200).json({
                sentCount: user.sentCount,
                receivedCount: user.receivedCount
            });
        } catch (error) {
            return res.status(500).json({ message: "Something went wrong, try again." });
        }
    },
    
    linkPartner: async (req, res) => {
        const { sub: uniqueId } = req.user;
        const { partnerId } = req.body;
    
        try {
            const user = await User.findOne({ uniqueId });
            const partner = await User.findOne({ uniqueId: partnerId });
    
            if (!user || !partner) {
                return res.status(404).json({ message: "One or both users not found." });
            }
    
            if (user.partnerId || partner.partnerId) {
                return res.status(400).json({ message: "One or both users are already linked to someone." });
            }
    
            user.partnerId = partner.uniqueId;
            partner.partnerId = user.uniqueId;
    
            await user.save();
            await partner.save();
    
            return res.status(200).json({ message: "Users linked successfully." });
        } catch (error) {
            return res.status(500).json({ message: "Something went wrong, try again." });
        }
    },

    unlinkPartner: async (req, res) => {
        const { sub: uniqueId } = req.user;
    
        try {
            const user = await User.findOne({ uniqueId });
    
            if (!user) return res.status(404).json({ message: "User not found." });
    
            if (!user.partnerId) return res.status(400).json({ message: "You are not linked with a partner." });
    
            const partner = await User.findOne({ uniqueId: user.partnerId });
    
            user.partnerId = null;
            user.sentCount = 0;
            user.receivedCount = 0;
    
            if (partner) {
                partner.partnerId = null;
                partner.sentCount = 0;
                partner.receivedCount = 0;
                await partner.save();
            }
    
            await user.save();
    
            return res.status(200).json({ message: "Unlinked successfully. Counters reset." });
        } catch (error) {
            return res.status(500).json({ message: "Something went wrong, try again." });
        }
    }
};
