
const { MultiDbORM, FireStoreDB, MongoDB, SQLiteDB, Sync } = require("multi-db-orm");

let records = require('./index')('recordtest', new FireStoreDB('./serviceAccount.json'))

records.init(5);

(async () => {

    for (let index = 0; index < 14; index++) {
        await records.record({ message: 'Test' + index })
    }
    await records.flush()

    await records.read()
    // await records.delete()

})()
