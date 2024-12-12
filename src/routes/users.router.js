import { Router } from "express";
import { uploader } from "../uploader.js";
import userManager from "../dao/users.manager.js";
import passport from "passport";
import initAuthStrategies from "../auth/passport.config.js";
import { validateToken, createToken, handlePolicies } from "../utils.js";
import config from "../config.js";
import nodemailer from "nodemailer";

const router = Router();
const manager = new userManager();
initAuthStrategies;
const transport = nodemailer.createTransport({
	service: "gmail",
	port: 587,

	auth: {
		user: config.gmailUser,

		pass: config.gmailPassword,
	},
});

export const auth = (req, res, next) => {
	if (
		(req.session?.userData && req.session?.userData.admin) ||
		req.session?.passport
	) {
		next();
	}
};

router.get("/", async (req, res) => {
	try {
		const data = await manager.get();
		res.status(200).send({ error: null, data: data });
	} catch (err) {
		res
			.status(500)
			.send({ error: "Error interno de ejecución del servidor", data: [] });
	}
});

// router.post('/', auth, uploader.array('thumbnail', 3), (req, res) => { // gestión de múltiples archivos
router.post("/", auth, uploader.single("thumbnail"), async (req, res) => {
	// gestión de archivo único
	try {
		const { name, age, email } = req.body;

		if (name != "" && age != "" && email != "") {
			const data = { name: name, age: +age, email: email };
			const process = await manager.add(data);
			res.status(200).send({ error: null, data: process });
		} else {
			res.status(400).send({ error: "Faltan campos obligatorios", data: [] });
		}
	} catch (err) {
		res
			.status(500)
			.send({ error: "Error interno de ejecución del servidor", data: [] });
	}
});

router.patch("/:id?", auth, async (req, res) => {
	try {
		const id = req.params.id;

		if (!id) {
			res.status(400).send({ error: "Se requiere parámetro id", data: null });
		} else {
			const { name, age, email } = req.body;
			const filter = { _id: id };
			const update = {};
			if (name) update.name = name;
			if (age) update.age = +age;
			if (email) update.email = email;
			const options = { new: true }; // new: true retorna el documento actualizado

			const process = await manager.update(filter, update, options);
			if (!process) {
				res.status(404).send({ error: "No se encuentra el usuario", data: [] });
			} else {
				res.status(200).send({ error: null, data: process });
			}
		}
	} catch (err) {
		res
			.status(500)
			.send({ error: "Error interno de ejecución del servidor", data: [] });
	}
});

router.delete("/:id?", auth, async (req, res) => {
	try {
		const id = req.params.id;

		if (!id) {
			res.status(400).send({ error: "Se requiere parámetro id", data: null });
		} else {
			const filter = { _id: id };
			const options = {};

			const process = await manager.delete(filter, options);
			if (!process) {
				res.status(404).send({ error: "No se encuentra el usuario", data: [] });
			} else {
				res.status(200).send({ error: null, data: process });
			}
		}
	} catch (err) {
		res
			.status(500)
			.send({ error: "Error interno de ejecución del servidor", data: [] });
	}
});

router.post(
	"/register",
	passport.authenticate("register", { failedRedirect: "/failedRegister" }),
	async (req, res) => {
		const { firstname, lastname, username, password, age } = req.body;

		if (
			firstname != "" &&
			lastname != "" &&
			username != "" &&
			password != "" &&
			age != ""
		) {
			const process = await manager.register({
				name: firstname,
				lastname,
				email: username,
				password,
				age,
			});

			if (process) {
				ransport.sendMail({
					from: `Sistema Coder <${config.GMAIL_APP_USER}>`, // email origen

					to: email,

					subject: "Registro exitoso!",

					html: `

                        <h1>tienda coder</h1>

                        <h2>Bienvenido al sistema!</h2>

                        <p>Su registro ha sido procesado correctamente, y ya

                        puede comenzar a comprar!.</p>

                    `,
					//el mail debe contener:de quien, a quien, tema,mail
				});
			} else {
				res
					.status(401)
					.send({ error: "Ya existe un usuario con ese email", data: [] });
			}
		} else {
			res.status(400).send({
				error:
					"Faltan campos: obligatorios firstname, lastname, email, password",
				data: [],
			});
		}
	}
);

router.post(
	"/login",
	passport.authenticate("login", { failureRedirect: "/failedLogin" }),
	async (req, res) => {
		req.session.save((err) => {
			if (err)
				return res
					.status(500)
					.send({ error: "Error al almacenar datos de sesión", data: [] });

			res.send("logueado"); //no me funciona el res.redirect a views/profile. a pesar de que la contraseña coincide
			// y el login funciona, me aparece no autorizado para el redirect
		});
	}
);
router.get("/failedLogin", (req, res) => {
	res.send("login fallido");
});

router.get("/logout", (req, res) => {
	req.session.destroy((err) => {
		if (err)
			return res
				.status(500)
				.send({ error: "Error al cerrar sesión", data: [] });

		// res.status(200).send({ error: null, data: 'Sesión cerrada' });
		res.redirect("/views/login");
	});
});

router.get("/private", auth, (req, res) => {
	res.status(200).send({
		error: null,
		data: "Este contenido solo es visible por usuarios autenticados",
	});
});
router.get(
	"/github",
	passport.authenticate("githubLogin", { scope: ["user:email"] }),
	(req, res) => {
		console.log("paso por aca");
	}
);

router.get(
	"/githubcallback",
	passport.authenticate("githubLogin", { failureRedirect: "/views/login" }),
	(req, res) => {
		console.log("por aqui paso");
		req.session.save((err) => {
			if (err)
				return res
					.status(500)
					.send({ error: "Error al almacenar datos de sesión", data: [] });

			res.redirect("views/profile");
		});
	}
);
router.post("/jwtlogin", async (req, res) => {
	const { username, password } = req.body;

	if (username != "" && password != "") {
		const process = await manager.authenticate(username, password);
		if (process) {
			const payload = {
				username: username,
				firstname: process.firstname,
				role: process.role,
			};
			// Generamos un token válido por 1 hora, y se lo devolvemos al cliente en la respuesta
			const token = createToken(payload, "10m");
			const date = new Date();
			res.cookie(`${config.appName}_cookie`, token, {
				httpOnly: true,
				signed: true,
				maxAge: date.setDate(date.getDate() + 1),
				secure: false,
			});
			res
				.status(200)
				.send({ error: null, data: { autentication: "ok via cookie" } });
		} else {
			res.status(401).send({ error: "Usuario o clave no válidos", data: [] });
		}
	} else {
		res.status(400).send({
			error: "Faltan campos: obligatorios username, password",
			data: [],
		});
	}
});
router.get("/private2", validateToken, handlePolicies, (req, res) => {
	res.status(200).send("el contenido es solo para usuarios autenticados");
});
router.all("*", async (req, res) => {
	res.status(404).send({ error: "Ruta no encontrada" });
});

export default router;
