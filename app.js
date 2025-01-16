const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const { GridFSBucket } = require('mongodb');
const multer = require('multer');
const fs = require('fs');
const ejs = require('ejs');
const { google } = require('googleapis');
const passport = require('passport');

const { isAuthenticated, isAdminAuthenticated } = require('./middlewares/session.js');

const faviconMiddleware = require('./middlewares/favicon');

const app = express();
const port = process.env.PORT || 3000;




// Middleware Setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(faviconMiddleware);
app.use(express.static(path.join(__dirname, 'public')));


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


const mongoConnectionString = 'mongodb+srv://uha:uha@cluster0.svk4d.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';


app.use(session({
    secret: crypto.randomBytes(64).toString('hex'),
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: mongoConnectionString }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
        httpOnly: true,
        secure: false // Ensure this is false for local development
    }
}));








// --------------------- MongoDB connection ---------------------

mongoose.connect('mongodb+srv://uha:uha@cluster0.svk4d.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    ssl: true,  // Imp for deployment certificates (DNS servers)
});


const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});










// --------------------- Schemas, Models & Emails ---------------------


const UserSchema = new mongoose.Schema({
    name: String,
    username: { type: String, unique: true },
    email: { type: String, unique: true },
    title: {
        type: String,
        default: ''
    },
    password: String,
    resetToken: String,
    resetTokenExpiration: Date
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);




const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'tk839587@gmail.com',
        pass: 'aptf fmrr yonc clhj'
    }
});


passport.serializeUser((user, done) => {
    done(null, user.id);
});


passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id).exec();
        done(null, user);
    }

    catch (error) {
        done(error, null);
    }
});


app.use(passport.initialize());
app.use(passport.session());












// --------------------- Routes ---------------------


app.get('/', (req, res) => {
    res.render("index.ejs");
});

app.get('/about-us', (req, res) => {
    res.render("about-us.ejs")
})

app.get('/advocacy', (req, res) => {
    res.render("advocacy.ejs")
})

app.get('/news', (req, res) => {
    res.render("news.ejs")
})

app.get('/contact-us', (req, res) => {
    res.render("contact-us.ejs")
})

app.get('/authentication-unitingcarehealth', (req, res) => {
    res.render("user/security-key.ejs");
});

app.get('/add-new-user', (req, res) => {
    res.render("user/add-new-user.ejs");
});

app.get('/login-user', (req, res) => {
    res.render("user/login-signup-user", { error: null });
});

app.get('/check-login-status', (req, res) => {

    if (req.session.user) {
        res.json({ loggedIn: true });
    }

    else {
        res.json({ loggedIn: false });
    }
});

app.post('/login-user', async (req, res) => {
    const { email, password } = req.body;

    try {
        const foundUser = await User.findOne({ email, password });

        if (foundUser) {
            req.session.user = foundUser;
            res.redirect('/user-dashboard');
        }

        else {
            res.render('user/login-signup-user', { error: 'Invalid username, email, or password.' });
        }
    }

    catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

app.post('/signup-user', async (req, res) => {

    try {
        const { username, email, password } = req.body;

        const existingUser = await User.findOne({ $or: [{ username }, { email }] });

        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const newUser = new User({ username, email, password });
        await newUser.save();

        const foundUser = await User.findOne({ username, email, password });

        if (foundUser) {
            req.session.user = foundUser;
            res.redirect('/user-dashboard');
        }

    }

    catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/test-admin', async (req, res) => {
    const securityKey = req.query.securityKey
    const predefinedSecurityKey = "2025";

    try {

        if (securityKey === predefinedSecurityKey) {
            res.render('user/add-new-user.ejs');
        }

        else {
            res.render('user/user-dashboard.ejs', { error: 'Invalid security key.' });
        }
    }

    catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

app.post('/admin-add-&-signup-user', async (req, res) => {

    try {
        const { username, email, password } = req.body;

        const existingUser = await User.findOne({ $or: [{ username }, { email }] });

        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const newUser = new User({ username, email, password });
        await newUser.save();

        const foundUser = await User.findOne({ username, email, password });

        if (foundUser) {
            res.redirect('/login-user');
        }
    }

    catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/user-dashboard', isAuthenticated, async (req, res) => {

    try {
        // const assignments = await Assignment.find({ email: req.session.user.email }).sort({ createdAt: -1 });

        res.render('user/user-dashboard', { user: req.session.user });
    }

    catch (error) {
        res.status(500).json({ message: 'Error fetching assignments', error });
    }
});

app.get('/logout', (req, res) => {

    req.session.destroy(err => {

        if (err) {
            return res.redirect('/user-dashboard');
        }

        res.clearCookie('connect.sid');
        res.redirect('/');
    });

});

app.get('/check-username', async (req, res) => {
    const { username } = req.query;

    try {
        const user = await User.findOne({ username });

        if (user) {
            res.json({ exists: true });
        }

        else {
            res.json({ exists: false });
        }
    }

    catch (err) {
        console.error(err);
        res.sendStatus(500);
    }

});

app.get('/check-email', async (req, res) => {
    const { email } = req.query;

    try {
        const user = await User.findOne({ email });

        if (user) {
            res.json({ exists: true });
        }

        else {
            res.json({ exists: false });
        }
    }

    catch (err) {
        console.error(err);
        res.sendStatus(500);
    }

});

app.post('/reset-password-user', async (req, res) => {

    const email = req.body.email;

    try {
        const foundUser = await User.findOne({ email });

        if (foundUser) {
            const resetToken = crypto.randomBytes(20).toString('hex');
            foundUser.resetToken = resetToken;
            foundUser.resetTokenExpiration = Date.now() + 3600000; // 1 hour
            await foundUser.save();

            const mailOptions = {
                from: 'tk839587@gmail.com',
                to: foundUser.email,
                subject: 'Password Reset',

                html:

                    `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ccc; border-radius: 8px; background: linear-gradient(to right, navy, white); text-align: center; position: relative;">
                    
                    <h1 style="color: #fff; margin-top: 0; padding: 20px 0; text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3); animation: fadeIn 2s ease-in-out;">
                    
                    <span style="font-weight: bold; font-size: 24px;">Uniting<i>Care</i> Health</span>
                    
                    </h1>
                
                    <div style="background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
                    
                    <p style="margin-bottom: 20px; color: #333;">You are receiving this email because you requested a password reset.</p>
                    
                    <p style="margin-bottom: 20px; color: #333;">Please click the following link to reset your password:</p>
                    
                    <a href="https://unitingcarehealth.onrender.com/reset-password-user/${resetToken}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">Reset Password</a>

                </div>
            </div>
            <style>
                @keyframes fadeIn {
                    0% {
                        opacity: 0;
                    }
                100% {
                    opacity: 1;
                }
            }
            </style>
        
        `
            };

            await transporter.sendMail(mailOptions);

            res.render('user/reset-password-user', { success: true, error: null });
        }

        else {
            res.render('user/reset-password-user', { error: 'Invalid email.' });
        }
    }

    catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

app.get('/reset-password-user/:resetToken', async (req, res) => {
    const resetToken = req.params.resetToken;

    try {
        const foundUser = await User.findOne({ resetToken });

        if (foundUser && foundUser.resetTokenExpiration > Date.now()) {
            res.render('user/reset-password-user', { resetToken, user: foundUser, error: null, success: false });
        }

        else {
            res.render('user/reset-password-user', { resetToken, user: null, error: 'Invalid or expired reset token.', success: false });
        }
    }

    catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

app.post('/reset-password-user/:resetToken', async (req, res) => {
    const resetToken = req.params.resetToken;
    const newPassword = req.body.newPassword;

    try {
        const foundUser = await User.findOne({ resetToken });

        if (foundUser && foundUser.resetTokenExpiration > Date.now()) {
            foundUser.password = newPassword;
            foundUser.resetToken = null;
            foundUser.resetTokenExpiration = null;
            await foundUser.save();
            res.render('user/password-reset-success-user', { message: 'Your password has been successfully reset.' });
        }

        else {
            res.render('user/reset-password-user', { resetToken: null, user: null, error: 'Invalid or expired reset token.', success: false });
        }
    }

    catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

app.get('/fetch-users', async (req, res) => {
    try {
        const users = await User.find({});
        res.render('user/fetch-all-users.ejs', {
            users
        });
    }

    catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

app.get('/edit-user/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).send('User not found');
        res.render('user/edit-user.ejs', { user });
    }

    catch (error) {
        console.error(error);
        res.status(500).send('Error fetching user');
    }
});

app.post('/update-user/:id', async (req, res) => {
    try {
        const { email, password } = req.body;
        await User.findByIdAndUpdate(req.params.id, { email, password });
        res.redirect('/fetch-users');
    }

    catch (error) {
        console.error(error);
        res.status(500).send('Error updating user');
    }
});

app.post('/delete-user/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.redirect('/fetch-users');
    }

    catch (error) {
        console.error(error);
        res.status(500).send('Error deleting user');
    }
});

app.post('/assign-admin/:id', async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.params.id, {
            $set: { title: 'Admin' }
        });
        res.redirect('/fetch-users');
    }

    catch (error) {
        console.error(error);
        res.status(500).send('Error assigning admin title');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});


// --------------------- End ---------------------
