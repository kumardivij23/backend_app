const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB Atlas connection string
const MONGODB_URI = 'mongodb+srv://divij23:Divij23@cluster0.hgjiats.mongodb.net/mydatabase?retryWrites=true&w=majority';

//mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect(MONGODB_URI);

mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'your-secret-key', resave: true, saveUninitialized: true }));
app.use(express.static('public'));

const User = mongoose.model('User', new mongoose.Schema({
    username: String,
    password: String,
}));

const Contact = mongoose.model('Contact', new mongoose.Schema({
    name: String,
    email: String,
    message: String,
}));

// Signup route
app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
        username,
        password: hashedPassword,
    });

    await newUser.save();
    res.send('Signup successful! Now you can <a href="/login">login</a>.');
});

// Login route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (user && (await bcrypt.compare(password, user.password))) {
        req.session.userId = user._id;
        res.redirect('/contact');
    } else {
        res.send('Invalid login credentials. <a href="/login">Try again</a>.');
    }
});

// Contact form submission route
app.post('/contact', async (req, res) => {
    const { name, email, message } = req.body;

    const newContact = new Contact({
        name,
        email,
        message,
    });

    await newContact.save();
    res.send('Thank you for contacting us! <a href="/logout">Logout</a>');
});

// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) throw err;
        res.redirect('/login');
    });
});
//home page route
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
});


// Login page route
app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
});

// Signup page route
app.get('/signup', (req, res) => {
    res.sendFile(__dirname + '/public/signup.html');
});

// Contact page route
app.get('/contact', (req, res) => {
    if (req.session.userId) {
        res.sendFile(__dirname + '/public/contact.html');
    } else {
        res.redirect('/login');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
