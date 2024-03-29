import { Collection } from "@discordjs/collection"
import { Interaction, Client, GatewayIntentBits, Message } from "discord.js"
import fs from "fs"
import path from "path"
require("dotenv").config()
import { log } from "./services/logger"
import { DataTypes, Sequelize } from "sequelize"
import { Stopwatch } from "@sapphire/stopwatch"
import { BootCheck } from "./utils/bootCheck"
import { Security } from "./services/security"
import express from "express"
import cors from "cors"
import helmet from "helmet"
import bodyParser from "body-parser"
import morgan from "morgan"
import Query from "./routes/query"

BootCheck.check()

// Create a new client instance
const dbSql = new Sequelize(process.env.SQL_URI as string, {
	username: process.env.SQL_USERNAME,
	password: process.env.SQL_PASSWORD,
	dialect: "mysql",
	ssl: true,
	dialectOptions: {
		ssl: {
			require: true,
		},
		multipleStatements: true,
	},
})
// model declarations

const Team = dbSql.define("Team", {
	name: {
		type: DataTypes.STRING,
		allowNull: false,
	},
})
const Supervisor = dbSql.define("Supervisor", {
	title: {
		type: DataTypes.STRING,
		allowNull: false,
	},
})
const StaffFile = dbSql.define("StaffFile", {
	name: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true,
	},
	personalEmail: {
		type: DataTypes.STRING,
		validate: {
			is: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
		},
		allowNull: true,
	},
	companyEmail: {
		type: DataTypes.STRING,
		validate: {
			is: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
		},
		allowNull: true,
	},
	photoLink: {
		type: DataTypes.STRING,
		allowNull: true,
	},
	phone: {
		type: DataTypes.STRING,
		allowNull: true,
	},
	legalSex: {
		type: DataTypes.STRING,
		allowNull: true,
	},
	genderIdentity: {
		type: DataTypes.STRING,
		allowNull: true,
	},
	ethnicity: {
		type: DataTypes.STRING,
		allowNull: true,
	},
	appStatus: {
		type: DataTypes.STRING,
		allowNull: true,
	},
	strikes: {
		type: DataTypes.INTEGER,
		allowNull: false,
		defaultValue: 0,
	},
	censures: {
		type: DataTypes.INTEGER,
		allowNull: false,
		defaultValue: 0,
	},
	pips: {
		type: DataTypes.INTEGER,
		allowNull: false,
		defaultValue: 0,
	},
	activityStatus: {
		type: DataTypes.STRING,
		allowNull: true,
	},
	alumni: {
		type: DataTypes.BOOLEAN,
		allowNull: false,
		defaultValue: false,
	},
})
const PositionHistory = dbSql.define("PositionHistory", {
	title: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	dept: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	team: {
		type: DataTypes.STRING,
		allowNull: true,
	},
	joined: {
		type: DataTypes.DATE,
		allowNull: false,
	},
	quit: {
		type: DataTypes.DATE,
		allowNull: true,
	},
})
const Position = dbSql.define("Position", {
	title: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true,
	},
})
const DiscordInformation = dbSql.define("DiscordInfo", {
	username: {
		type: DataTypes.STRING,
		validate: {
			is: /.{1,}#[0-9]{4}/,
		},
		allowNull: false,
	},
	discordId: {
		type: DataTypes.STRING,
		validate: {
			is: /[0-9]{17,}/,
		},
		allowNull: false,
		unique: true,
	},
})
const Department = dbSql.define("Department", {
	name: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true,
	},
})
const StrikeHistory = dbSql.define("StrikeHistory", {
	details: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	dateGiven: {
		type: DataTypes.DATE,
		allowNull: false,
	},
	administrator: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	evidenceLink: {
		type: DataTypes.STRING,
		allowNull: true,
	},
})
const CensureHistory = dbSql.define("CensureHistory", {
	details: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	dateGiven: {
		type: DataTypes.DATE,
		allowNull: false,
	},
	administrator: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	evidenceLink: {
		type: DataTypes.STRING,
		allowNull: true,
	},
})
const PIPHistory = dbSql.define("PIPHistory", {
	details: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	dateGiven: {
		type: DataTypes.DATE,
		allowNull: false,
	},
	administrator: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	evidenceLink: {
		type: DataTypes.STRING,
		allowNull: true,
	},
})
const BreakRecord = dbSql.define("BreakRecord", {
	dateFrom: {
		type: DataTypes.DATE,
		allowNull: false,
	},
	dateTo: {
		type: DataTypes.DATE,
		allowNull: false,
	},
	reason: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	approval: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
})
const Tickets = dbSql.define("Tickets", {
	channelId: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	authorId: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	paneltpguid: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	status: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	openDate: {
		type: DataTypes.DATE,
		allowNull: false,
	},
	closeDate: {
		type: DataTypes.DATE,
		allowNull: true,
	},
})
const TicketPanels = dbSql.define("TicketPanels", {
	name: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	value: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	description: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	channelPrefix: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	guildId: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	buttonName: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	tpguid: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	messageLink: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	category: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	logChannel: {
		type: DataTypes.STRING,
		allowNull: false,
	},
})

// Supervisor Associations
Supervisor.hasMany(Department)
Department.belongsTo(Supervisor)

Supervisor.belongsTo(StaffFile)
StaffFile.hasOne(Supervisor)

Supervisor.hasMany(Team)
Team.belongsToMany(Supervisor, { through: "TeamSupervisor" })

// StaffFile Associations
StaffFile.hasOne(DiscordInformation)
DiscordInformation.belongsTo(StaffFile)

StaffFile.hasMany(PositionHistory)
PositionHistory.belongsTo(StaffFile)

StaffFile.hasMany(StrikeHistory)
StrikeHistory.belongsTo(StaffFile)

StaffFile.hasMany(CensureHistory), CensureHistory.belongsTo(StaffFile)

StaffFile.hasMany(PIPHistory)
PIPHistory.belongsTo(StaffFile)

StaffFile.hasMany(BreakRecord)
BreakRecord.belongsTo(StaffFile)

StaffFile.belongsTo(Team)
Team.hasMany(StaffFile)

StaffFile.belongsTo(Department)
Department.hasMany(StaffFile)

Position.hasMany(StaffFile)
StaffFile.belongsToMany(Position, {
	through: "PositionStaff",
})

// Team Associations

Team.belongsTo(Department)
Department.hasMany(Team)

// Others

Position.hasMany(PositionHistory)
PositionHistory.belongsTo(Position)

Department.hasMany(PositionHistory)
PositionHistory.belongsTo(Department)

Position.belongsTo(Department)
Department.hasMany(Position)

const client: Client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildBans,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
})
// @ts-ignore
client.commands = new Collection()
const commandsPath = path.join(__dirname, "commands")
const eventsPath = path.join(__dirname, "events")

const commandFiles = fs
	.readdirSync(commandsPath)
	.filter((file) => file.endsWith("ts"))

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file)
	const command = require(filePath)
	// @ts-ignore
	client.commands.set(command.data?.name, command)
}

client.textCommands = new Collection()
const textCommandFiles = fs
	.readdirSync("./textCommands")
	.filter((file) => file.endsWith(".ts"))
for (const file of textCommandFiles) {
	const command = require(`./textCommands/${file}`)
	client.textCommands.set(command.name, command)
}

declare module "discord.js" {
	export interface Client {
		commands: Collection<unknown, any>
		textCommands: Collection<unknown, any>
	}
}

const app = express()



app.use(helmet())
app.use(bodyParser.json())
app.use(cors({
	origin: "*"
}))
app.use(morgan('combined'))
/**app.all('*', function(req: any, res: any, next: any) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	res.header('Access-Control-Allow-Headers', 'Content-Type');
	next();
});*/



app.listen(3000, () => {
	console.log("Server started on port 3000")
})

client.once("ready", async () => {
	const sw = new Stopwatch().start()
	log.success(`Readied in ${sw.stop().toString()}!`)
})

client.on("interactionCreate", async (interaction: Interaction) => {
	if (
		interaction.isChatInputCommand() ||
		interaction.isMessageContextMenuCommand()
	) {
		const command = client.commands.get(interaction.commandName)

		if (!command) return

		try {
			await command.execute(interaction)
		} catch (error) {
			const ID = log.error(
				error,
				`Command ${interaction.commandName}, User: ${interaction.user.tag}(${interaction.user.id}), Guild: ${interaction.guild?.name}(${interaction.guildId}), Options: ${interaction.options}`,
				true
			)
			interaction.reply(
				`An error occured while executing the command.\n\nError ID: ${ID}`
			)
		}
	}
})

client.on("messageCreate", async (message: Message) => {
	const prefix = process.env.DEV_PREFIX as string
	if (message.content.startsWith(prefix) && !message.author.bot) {
		const args = message.content.slice(prefix.length).trim().split(/ +/)
		const commandName = args.shift()?.toLowerCase()

		const command =
			(await client.textCommands.get(commandName)) ||
			(await client.textCommands.find(
				(cmd) => cmd.aliases && cmd.aliases.includes(commandName)
			))

		if (!command) return

		if (!client.textCommands.has(command.name)) return

		try {
			//* Text commands will always be developer only.
			Security.basicDevCheck(message.author)
				.then((result) => {
					if (result.status !== 1) {
						log.warn(
							`${message.author.tag} (${message.author.id}) tried to use a developer only command.`
						)
						return
					}
				})
				.catch((err) => {
					log.error(err)
				})
			client.textCommands.get(command.name).execute(message, args)
		} catch (error) {
			const ID = log.error(
				error,
				`Command ${JSON.stringify(command)}, User: ${message.author.tag}(${
					message.author.id
				}), Guild: ${message.guild?.name}(${message.guildId}), Args: ${args}`,
				true
			)
			message.reply(
				`An error occurred while executing the command.\n\nError ID: ${ID}`
			)
		}
	}
})

client.login(process.env.TOKEN)

export default client
export {
	dbSql,
	Department,
	DiscordInformation,
	PositionHistory,
	Position,
	StaffFile,
	Supervisor,
	Team,
	app
}
