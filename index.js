require('dotenv').config()
const { MongoClient, ObjectId } = require('mongodb')

const url = process.env.MONGODB_URL
const dbName = process.env.DATABASE
const client = new MongoClient(url)

async function main() {
  await client.connect()
  console.log('Conectado com sucesso!')
  const db = client.db(dbName)
  let result = ''

  const user = {
      nome: "Danilo Martin",
      nascimento: new Date(1999,3,14),
      login: 'd.silveira'
  }

  //insert user in collection users
  const insertResult = await db.collection('users').insertOne(user)
  const insertedId = insertResult.insertedId

  // consultando usuário inserido
  result = await db.collection('users').findOne({ '_id': insertedId })
  console.log('Usuário inserido. Resultado: ', result)

  // consultando todos usuários
  result = await db.collection('users').find().toArray()
  console.log('Lista de usuários. Resultado: ', result)

  

  // atualizando um usuário - 1 método
  result = await db.collection('users').updateOne(
    { '_id': insertedId }, 
    { $set: { 'ativo': 1 } }
  )
  console.log('Usuário atualizado. Resultado: ', result)

  // // atualizando um usuário - 2 método
  const userUpdate = {
    nome: "Danilo Martin da Silveira",
    email: 'xxxxx@xx.xx',
    telefone: '(99)99999-9999'
  }
  result = await db.collection('users').updateMany(
    { 'login': 'd.silveira' }, 
    { $set: userUpdate }
  )
  console.log('Atualizando usuario objeto. Resultado: ', result)



  const group = {
    name: "Grupo Teste",
    active: 1,
    users: [insertedId]
  }

  // inserindo o grupo
  result = await db.collection('groups').insertOne(group)
  console.log('Inserido o grupo. Resultado: ', result)

  // consultando os grupos e fazendo relacionamento com usuário (inner join)
  result = await db.collection('groups').aggregate([
    {
      '$match': { 'active': 1 }
    },
    {
      '$lookup': {
        'from': 'users',
        'localField': 'users',
        'foreignField': '_id',
        'as': 'users'
      }
    },
    {
      '$match': { 'users': { '$ne': [] } }
    }
  ]).toArray()
  console.log('Consultando o grupo com relacionamento. Resultado: ', result[0])
}

main()
  .then()
  .catch(console.error)
  .finally(() => client.close())

  