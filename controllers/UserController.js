//  Importando dotenv para pegar chave da API
require("dotenv").config();

const bcrypt = require("bcrypt");
const { check, validationResult, body } = require("express-validator");
const { sequelize, User, Pet } = require("../models");

const { costumizeErrors } = require("../helpers/utils");
const upload = require("../helpers/upload");

// Importando pacote para usar com a API
const NodeGeocoder = require("node-geocoder");
// Configurações da API
const options = {
  provider: "google",
  apiKey: process.env.API_KEY,
  formatter: null,
};
const geocoder = NodeGeocoder(options);

let UserController = {
  store: async (req, res) => {
    const errors = validationResult(req);
    console.log(errors, errors.isEmpty());

    if (errors.isEmpty()) {
      const { email, senha, nome, confirmar_senha } = req.body;

      const usuario = await User.findOne({
        where: {
          email,
        },
      }).then((u) => u);
      console.log(usuario);

      //Validar se usuário já existe
      if (usuario) {
        // res.redirect("/cadastrar?error=1");
        res.render("screen/register-user", {
          errors: {
            email: "Email já utilizado",
          },
          usuario: {
            ...req.body,
          },
        });

        console.log(errors);
      } else {
        const usuario = await User.create({
          email,
          senha: bcrypt.hashSync(senha, 10),
          nome,
        });
        res.render("screen/login", { errors: {}, usuario:{email:usuario.email}});
        // cria o user no db
      }
    }

    const e = costumizeErrors(errors);
    res.render("screen/register-user", {
      errors: e,
      usuario: {
        ...req.body,
      },
    });
  },
  // Uso da API
  update: async (req, res) => {
    const errors = validationResult(req);
    console.log(errors, req.body, req.file, errors.isEmpty());

    if (errors.isEmpty()) {
    const id = req.session.user.id;
    if (req.file) {
      // var image = `/images/${req.file.originalname}`;
      req.body.image = req.file.filename;
      var image = req.body.image;
      console.log(image)
    }

    const usuario = await User.update(
      {
        ...req.body,
        image,
      },
      { where: { id } }
    );

    const { nome } = await User.findOne({
      where: {
        id,
      },
    });

    req.session.save(() => {
      req.session.user.nome = nome;
      res.render("screen/edit-user", usuario);
    });
  }
  const e = costumizeErrors(errors);
  res.render("screen/edit-user", {
    errors: e,
    usuario: {
      ...req.body,
    },

  });
    
  },
  delete: (req, res) => {
    // deleta o usuario
  },
  login: async (req, res) => {
    const errors = validationResult(req);
    console.log(errors, errors.isEmpty());
    if (errors.isEmpty()) {
      const { email, senha } = req.body;
      const usuario = await User.findOne({
        where: {
          email,
        },
      }).then((u) => u);

      // falta validar se o usuario existe ou n
      if (!usuario) {
        // res.redirect("/login?error=1");
        res.render("screen/login", {
          errors: {
            email: "Email inválido",
            senha: "Senha inválida",
          },
          usuario: {
            ...req.body,
          },
        });
      }
      // falta validar a senha
      if (!bcrypt.compareSync(senha, usuario.senha)) {
        res.render("screen/login", {
          errors: {
            email: "Email inválido",
            senha: "Senha inválida",
          },
          usuario: {
            ...req.body,
          },
        });
      }
      // faz login aka salva o cooke
      req.session.user = usuario;

      return res.redirect("/");
    }
    const e = costumizeErrors(errors);
    res.render("screen/login", {
      errors: e,
      usuario: {
        ...req.body,
      },
    });
  },
  show: async (req, res) => {
    const { id } = req.params;

    const usuario = await User.findOne({
      where: { id },
      include: [
        //"pets",
      {
        model: Pet,
        as: "pets",
        include: ["fotoPrincipal", "raca"]
      },
    ],
   });
    console.log(usuario)
    if (!usuario) return res.render("404-not-found");
    res.render("screen/owner-profile", { usuario });
  },
  showGerenciamento: async (req, res) => {
    const { id } = req.session.user;

    const user = await User.findOne({
      where: { id },
      include: [
        // "pets",
        {
          model: Pet,
          as: "pets",
          include: "fotoPrincipal",
        },
      ],
    });

    res.render("screen/manager-pet", { pets: user.pets });
  },
  showUpdate: async (req, res) => {
    const usuario = await User.findOne({
      where: {
        id: req.session.user.id,
      }
    });
    // console.log(usuario)
    res.render("screen/edit-user", {  errors:{}, usuario });
  },
};

module.exports = UserController;
