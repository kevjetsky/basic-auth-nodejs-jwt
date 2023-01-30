import User from './model';
import { v4 as uuid } from'uuid'; 
import { encryptPassword } from '../../utils/bcrypt';
import { signToken } from '../../utils/jwt';

export default {
    sign_up: async (req, res) => {
        const {
            firstName,
            lastName,
            email,
            password
        } = req.body;

        const user = await User.findOne({ email });

        if(user) return res.status(401).json({ msg: "You have an account with this email, please sign_in" });

        const newUser = new User({
            firstName,
            lastName,
            email,
            password: encryptPassword(password),
            uniqueId: uuid()
        });

        await newUser.save();

        const token = signToken(newUser.uniqueId);

        return res.status(201).json(token);
    }
}