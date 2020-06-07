const express = require("express");
const server = express();

//Banco de dados
const db = require("./database/db")

server.use(express.static("public"));

//Habilitar o uso do req.body
server.use(express.urlencoded({
  extended: true
}))

//Template Engine
const nunjucks = require("nunjucks");
nunjucks.configure("src/views", {
  express: server,
  noCache: true
})

server.get("/", (req, res) => {
  return res.render("index.html", {
    title: "Um titulo"
  })
});



server.get("/create-point", (req, res) => {

  //req.query = São as query strings da url 
  //console.log(req.query)

  return res.render("create-point.html")
});

server.post("/savepoint", (req, res) => {

  //req.body = Corpo do formulário
  //console.log(req.body)

  //Inserir dados no banco de dados
  const query = `
  INSERT INTO places (
      image,
      name,
      address,
      address2,
      state,
      city,
      items
  ) VALUES (?,?,?,?,?,?,?);`

  const values = [
    req.body.image,
    req.body.name,
    req.body.address,
    req.body.address2,
    req.body.state,
    req.body.city,
    req.body.items
  ]

  function afterInsertData(err) {
    if (err) {
      console.log(err)
      return res.send("Erro no cadastro")
    }

    console.log("Cadastrado com sucesso")
    console.log(this)

    return res.render("create-point.html", { saved: true })
  }

  db.run(query, values, afterInsertData)

 
})

server.get("/search", (req, res) => {

  const search = req.query.search

  if(search == ""){
    //pesquisa vazia
    return res.render("search-results.html", {
      total: 0
    })
  }

  //Consultar informações do banco de dados
  db.all(`SELECT * FROM places WHERE city LIKE '%${search}%'`, function (err, rows) {
    if (err) {
      return console.log(err)
    }
    const total = rows.length

    //Mostrar a página html com os dados do DB
    return res.render("search-results.html", {
      places: rows,
      total: total
    })
  })


})






server.listen(3000);