let records = require('./index')('recordtest')

records.init(5);

(async () => {

    for (let index = 0; index < 14; index++) {
        await records.record({ message: 'Test' + index })
    }
    await records.flush()

    await records.read()
    // await records.delete()

})()
