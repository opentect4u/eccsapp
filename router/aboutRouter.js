const AboutRouter = require('express').Router()
const { ABOUT_TYPE_LIST } = require('../model/masterModel')
const {F_Select, Api_Insert} = require('../controller/masterController'),
dateFormat = require('dateformat');

AboutRouter.get('/entry_about', async (req, res) => {
    var about_list = ABOUT_TYPE_LIST
    var data = {about_list, heading: "Entry About Section"}
    res.render('about_sec/entry', data)
})

AboutRouter.post('/get_about_dtls_ajax', async (req, res) => {
    var data = req.body
    var user = req.session.user
    var pax_id = user.BANK_ID,
        fields = "*",
        table_name = `md_about`,
        where = `bank_id=${user.BANK_ID} AND type = '${data.type}' ${data.sl_no > 0 ? `AND SL_NO=${data.sl_no}` : ''}`,
        order = null,
        flag = 0;
    var resDt = await F_Select(pax_id, fields, table_name, where, order, flag)
    res.send(resDt);
})

AboutRouter.post('/entry_about', async (req, res) => {
    var user = req.session.user
    var data = req.body;
  var datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
  var pax_id = user.BANK_ID,
    table_name = "md_about",
    fields = data.sl_no > 0 ? `TYPE = :type, ABOUT_DTLS = :aboutDtls, MODIFIED_BY = :modifiedBy, MODIFIED_DT = :modifiedDt` : `SL_NO, BANK_ID, TYPE, ABOUT_DTLS, CREATED_BY, CREATED_DT`,
    fieldIndex = `((SELECT Decode(MAX(SL_NO),1,MAX(SL_NO),0)+1 FROM md_about), :bankId, :type, :aboutDtls, :modifiedBy, :modifiedDt)`,
    values = {
        bankId: user.BANK_ID,
        type: data.about_type,
        aboutDtls: data.narration,
        modifiedBy: user.USER_NAME,
        modifiedDt: dateFormat(datetime, "dd-mmm-yy")
    },
    where = data.sl_no > 0 ? `sl_no = ${data.sl_no}` : null,
    flag = data.sl_no > 0 ? 1 : 0;
    
  var resDt = await Api_Insert(
    pax_id,
    table_name,
    fields,
    fieldIndex,
    values,
    where,
    flag
  );
  res.send(resDt);
})

module.exports = {AboutRouter}