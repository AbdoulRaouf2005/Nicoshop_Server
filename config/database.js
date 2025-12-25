
import sqlite3 from 'sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Chemin vers le fichier de base de données
const dbPath = path.join(__dirname, '../nicoshop.db')

// Ouvrir la base avec sqlite3 (callback API) et fournir un wrapper promise-based
sqlite3.verbose()
const rawDb = new sqlite3.Database(dbPath, (err) => {
	if (err) {
		console.error('Erreur ouverture SQLite:', err.message)
		process.exit(1)
	}
	console.log(`✅ Base de données SQLite connectée: ${dbPath}`)
})

// Promisified helpers
function run(sql, params = []) {
	return new Promise((resolve, reject) => {
		rawDb.run(sql, params, function (err) {
			if (err) return reject(err)
			resolve(this) // this.lastID, this.changes
		})
	})
}

function get(sql, params = []) {
	return new Promise((resolve, reject) => {
		rawDb.get(sql, params, (err, row) => {
			if (err) return reject(err)
			resolve(row)
		})
	})
}

function all(sql, params = []) {
	return new Promise((resolve, reject) => {
		rawDb.all(sql, params, (err, rows) => {
			if (err) return reject(err)
			resolve(rows)
		})
	})
}

function exec(sql) {
	return new Promise((resolve, reject) => {
		rawDb.exec(sql, (err) => {
			if (err) return reject(err)
			resolve()
		})
	})
}

async function transaction(fn) {
	await run('BEGIN')
	try {
		const result = await fn()
		await run('COMMIT')
		return result
	} catch (err) {
		await run('ROLLBACK')
		throw err
	}
}

// Activer les clés étrangères
run("PRAGMA foreign_keys = ON").catch(err => console.error('PRAGMA FK error', err))

export default {
	raw: rawDb,
	run,
	get,
	all,
	exec,
	transaction,
}