//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://<username>:<Password>@cluster0.wfslpvi.mongodb.net/TODOlistDB");

const todoSchema = new mongoose.Schema({
  task: String,
});

const Item = mongoose.model("Item", todoSchema);

const constTask = new Item({
  task: "Type in below to create your first task.",
});

const constTask2 = new Item({
  task: "press the + button to add it.",
});

const constTask3 = new Item({
  task: "<-- to delete your task.",
});

const defaultItems = [constTask, constTask2, constTask3];

//
const categorySchema = new mongoose.Schema({
  name: String,
  items: [todoSchema],
});

const Category = mongoose.model("Category", categorySchema);

app.get("/", function (req, res) {
  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully saved");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  });
});

app.post("/", function (req, res) {
  const item = req.body.newItem;
  const listName = req.body.list;

  const inputItem = new Item({
    task: item,
  });

  if (listName === "Today") {
    inputItem.save();
    res.redirect("/");
  } else {
    Category.findOne({ name: listName }, function (err, foundList) {
      foundList.items.push(inputItem);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function (req, res) {
  const checkedItem = req.body.checkbox;
  const listName = req.body.ListName;

  if (listName === "Today") {
    Item.findByIdAndDelete(checkedItem, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("1 Item deleted");
      }
    });
    res.redirect("/");
  } else {
    Category.findOneAndUpdate(
      { name: listName },
      { $pull: { items: {_id: checkedItem } } },
      function (err) {
        if (!err) {
          res.redirect("/" + listName);
        }
      }
    );
  }
});

app.get("/:category", function (req, res) {
  const category = _.capitalize(req.params.category);
  Category.findOne({ name: category }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        const list = new Category({
          name: category,
          items: defaultItems,
        });
        list.save();
        res.redirect("/" + category);
      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    }
  });
});

app.get("/about", function (req, res) {
  res.render("about");
});

let port = process.env.PORT;
if (port === null || port === " "){
  port = 3000;
}
app.listen(port, function () {
  console.log("Server started on port 3000");
});
