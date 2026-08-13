const app = require('./app')
const PORT = process.env.PORT || 4000;

//checking server is running
app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
})