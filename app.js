const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const methodOverride = require('method-override');
const res = require('express/lib/response');
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
const port = 3000;

let db;

MongoClient.connect(
  'mongodb+srv://<username>:<password>@cluster0.2wcr6.mongodb.net/<collection>?retryWrites=true&w=majority',
  (error, client) => {
    if (error) return console.log(error);
    db = client.db('seohopost');
    app.listen(port, () => console.log(`listening on ${port}`));
  }
);

app.use((req, res, next) => {
  console.log('Request URL:', req.originalUrl, ' - ', new Date());
  next();
});

app.get('/', (req, res) => {
  res.redirect('/postList');
});

app.get('/postWrite', (req, res) => {
  res.render('postWrite.ejs');
});

app.get('/postList', (req, res) => {
  db.collection('post')
    .find()
    .sort({ _id: -1 })
    .toArray((error, result) => {
      res.render('postList.ejs', { posts: result });
    });
});

app.post('/postAdd', (req, res) => {
  const postDate = new Date().toLocaleDateString();
  db.collection('counter').findOne({ name: 'totalPost' }, (error, result) => {
    const totalPost = result.totalPost;
    db.collection('post').insertOne(
      {
        _id: totalPost + 1,
        postTitle: req.body.postTitle,
        postAuthor: req.body.postAuthor,
        postPw: req.body.postPw,
        postContent: req.body.postContent,
        postDate: postDate,
      },
      (error, result) => {
        if (error) console.log(error);
        console.log('saved');
      }
    );
    res.redirect('/postList');
    db.collection('counter').updateOne(
      { name: 'totalPost' },
      { $inc: { totalPost: 1 } },
      (error, result) => {
        if (error) console.log(error);
      }
    );
  });
});

app.get('/postDelete/:id', (req, res) => {
  db.collection('post').findOne(
    { _id: parseInt(req.params.id) },
    (error, result) => {
      res.render('postDelete.ejs', { post: result });
    }
  );
});

app.delete('/postDelete', (req, res) => {
  db.collection('post').findOne(
    { _id: parseInt(req.body.id) },
    (error, result) => {
      if (result.postPw !== req.body.postPw) {
        res.status(400).send('비밀번호가 틀렸습니다. 다시 입력해주세요');
      } else {
        db.collection('post').deleteOne(
          { _id: parseInt(req.body.id) },
          (error, result) => {
            console.log('deleted');
            res.redirect('/postList');
          }
        );
      }
    }
  );
});

app.get('/postContent/:id', (req, res) => {
  db.collection('post').findOne(
    { _id: parseInt(req.params.id) },
    (error, result) => {
      res.render('postContent.ejs', { data: result });
    }
  );
});

app.get('/postEdit/:id', (req, res) => {
  db.collection('post').findOne(
    { _id: parseInt(req.params.id) },
    (error, result) => {
      res.render('postEdit.ejs', { post: result });
    }
  );
});

app.put('/postEdit', (req, res) => {
  db.collection('post').findOne(
    { _id: parseInt(req.body.id) },
    (error, result) => {
      if (result.postPw !== req.body.postPw) {
        res.status(400).send('비밀번호가 틀렸습니다. 다시입력해주세요');
      } else {
        db.collection('post').updateOne(
          { _id: parseInt(req.body.id) },
          {
            $set: {
              postTitle: req.body.postTitle,
              postAuthor: req.body.postAuthor,
              postContent: req.body.postContent,
            },
          },
          (error, result) => {
            console.log('edited');
            res.redirect('/postList');
          }
        );
      }
    }
  );
});
