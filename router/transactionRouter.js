const transRouter = require('express').Router();
const {F_Select, Api_Insert} = require('../controller/masterController'),
dateFormat = require('dateformat');

const getTransDtls = (bank_id, trns_id = 0) => {
    return new Promise(async (resolve, reject) => {
        var pax_id = bank_id,
            fields = "a.trns_id, a.trns_dt, a.entry_dt, a.cust_id, b.user_name, a.trns_amt, a.chq_no, a.chq_dt, a.bank_name, a.bank_id",
            table_name = `TD_TRANSACTION_UPLOAD a, MD_USER b`,
            where = `a.cust_id = b.cust_cd AND a.bank_id=${bank_id} ${trns_id > 0 ? `AND a.TRNS_ID=${trns_id}` : ''}`,
            order = null,
            flag = trns_id > 0 ? 0 : 1;
        var resDt = await F_Select(pax_id, fields, table_name, where, order, flag)
        resolve(resDt)
    })
}

transRouter.get('/trans_dtls', async (req, res) => {
    var user = req.session.user
    var trn_dt = await getTransDtls(user.BANK_ID)
    var data = {trn_dt: trn_dt.suc > 0 ? trn_dt.msg : [], heading: "Entry About Section", dateFormat}
    res.render('transaction/view', data)
})

module.exports = {transRouter}