const express = require("express")
const session = require("express-session");
const bodyParser = require("body-parser");
const app = express()
const path = require("path")
const hbs = require("hbs")
const collection = require("./mongodb")
const User = require("./mongodb");

const templatePath = path.join(__dirname, '../templates')
const publicPath = path.join(__dirname, '../public');

app.use(session({
    secret: 'dubemandprince', // Replace with a secret key
    resave: false,
    saveUninitialized: true
}));

app.use(express.json())
app.set("view engine", "hbs")
app.set("views", templatePath)
app.use(express.urlencoded({extended:false}))
app.use(express.static('public', { 'extensions': ['html', 'hbs'], 'index': false }));
// Set MIME types explicitly
express.static.mime.define({ 'text/css': ['css'] });

//Global error handling
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).send("Internal Server Error");
});


app.get("/", (req,res)=>{
  res.render("index")
})

app.get("/login", (req,res)=>{
    res.render("login")
})

app.get("/register", (req,res)=>{
    res.render("register")
})


//This handles errors for the root route 
app.get("/", async (req, res) => {
  try {
    // Any asynchronous or synchronous code you have for rendering the index page
    res.render("index");
  } catch (error) {
    console.error("Error in / route:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/register", async (req,res)=>{
    const data = {
        name:req.body.name,
        password:req.body.password
    }

    await collection.insertMany([data])
    res.render("indexlogged")
})

app.post("/login", async (req, res) => {
    const { name, password } = req.body;
  
    try {
      const user = await collection.findOne({ name, password });
  
      if (user) {
        // Set the userId in the session
        req.session.userId = user._id;
        console.log(req.session.userId)
        res.render("indexlogged");
      } else {
        res.send("Invalid login credentials");
      }
    } catch (error) {
      console.error("Error in /login route:", error);
      res.status(500).send("Internal Server Error");
    }
  });

app.get("/account", async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).send("Unauthorized");
        }

        const userId = req.session.userId;
        const account = await collection.findOne({ _id: userId });

        if (!account) {
            return res.status(404).send("Account not found");
        }

        res.render("account", { account });
    } catch (error) {
        console.error("Error in /account route:", error);
        res.status(500).send("Internal Server Error");
    }
});


// Route for changing account password
app.get("/account/:id/change-password", async (req, res) => {
  const userId = req.params.id;
  res.render("changepassword", { userId });
});

app.post("/account/:id/change-password", async (req, res) => {
  const userId = req.params.id;
  const newPassword = req.body.newPassword;

  try {
    // Implement logic to change the account password
    // For example, using mongoose:
    const updatedAccount = await collection.findByIdAndUpdate(
      userId,
      { password: newPassword },
      { new: true } // Ensure to get the updated document
    );

    if (!updatedAccount) {
      return res.status(404).send("Account not found");
    }

    res.redirect(`/account/${userId}`);
  } catch (error) {
    console.error("Error in /account/:id/change-password route:", error);
    res.status(500).send("Internal Server Error");
  }
});

  

// Route for deleting the account
app.post("/account/:id/delete", async (req, res) => {
    try {
        await collection.findByIdAndDelete(req.params.id);
        res.redirect("/");
    } catch (error) {
        res.status(500).send("Internal Server Error");
    }
});

// Route for viewing account information
app.get("/account/:id", async (req, res) => {
    try {
      const account = await collection.findById(req.params.id);
      res.render("account", { account });
    } catch (error) {
      res.status(500).send("Internal Server Error");
    }
  });


  app.post("/add-to-favourites", async (req, res) => {
    try {
        // Check if the user is authenticated (you can customize this based on your authentication logic)
        // if (!req.session.userId) {
        //     return res.status(401).json({ error: 'Unauthorized' });
        // }
  
        const userId = req.session.userId;
        const { hotelId, hotelName, reviewScore, price } = req.body;
  
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $push: {
                    favourites: {
                        hotelId,
                        hotelName,
                        reviewScore,
                        price,
                    },
                },
            },
            { new: true }
        );
  
        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }
  
        res.json({ message: 'Hotel added to favourites successfully' });
    } catch (error) {
        console.error("Error in /add-to-favorites route:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  


app.get('/indexlogged', (req, res) => {
  res.render('indexlogged');
});

app.get("/favourites", async (req, res) => {
  try {
      if (!req.session.userId) {
          return res.status(401).send("Unauthorized");
      }

      const userId = req.session.userId;
      const user = await User.findById(userId);

      if (!user) {
          return res.status(404).send("User not found");
      }

      res.render("favourites", { favourites: user.favourites });
  } catch (error) {
      console.error("Error in /favourites route:", error);
      res.status(500).send("Internal Server Error");
  }
});


app.listen(3000,()=>{
    console.log("port connected");
})
