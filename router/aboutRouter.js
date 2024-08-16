const AboutRouter = require('express').Router()
const { ABOUT_TYPE_LIST } = require('../model/masterModel')
const {F_Select, Api_Insert, saveAboutSection} = require('../controller/masterController'),
dateFormat = require('dateformat'),
oracledb = require("oracledb");

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
  var sql_data = {}
  if(data.sl_no){
    sql_data = {
        typeTxt: { val: data.about_type, type: oracledb.STRING, maxSize: 50 },
        aboutDtls: { val: data.narration.split("'").join("\\'").split('\r\n').join(' '), type: oracledb.STRING, maxSize: 4000 },
        modifiedBy: { val: user.USER_NAME, type: oracledb.STRING, maxSize: 50 },
        modifiedDt: { val: new Date(datetime), type: oracledb.DATE },
        slNo: {val: parseInt(data.sl_no), type: oracledb.NUMBER, maxSize: 11}
    }
  }else{
    sql_data = {
        bankId: { val: parseInt(user.BANK_ID), type: oracledb.NUMBER, maxSize: 11 },
        typeTxt: { val: data.about_type, type: oracledb.STRING, maxSize: 50 },
        aboutDtls: { val: data.narration.split("'").join("\\'").split('\r\n').join(' '), type: oracledb.STRING, maxSize: 4000 },
        modifiedBy: { val: user.USER_NAME, type: oracledb.STRING, maxSize: 50 },
        modifiedDt: { val: new Date(datetime), type: oracledb.DATE },
        slNo: {val: parseInt(data.sl_no), type: oracledb.NUMBER, maxSize: 11}
    }
  }
  var pax_id = user.BANK_ID,
    table_name = "md_about",
    fields = data.sl_no > 0 ? `TYPE = :typeTxt, ABOUT_DTLS = :aboutDtls, MODIFIED_BY = :modifiedBy, MODIFIED_DT = :modifiedDt` : `SL_NO, BANK_ID, TYPE, ABOUT_DTLS, CREATED_BY, CREATED_DT`,
    fieldIndex = `((SELECT Decode(MAX(SL_NO),1,MAX(SL_NO),0)+1 FROM md_about), :bankId, :typeTxt, :aboutDtls, :modifiedBy, :modifiedDt)`,
    values = sql_data,
    where = data.sl_no > 0 ? `sl_no = :slNo` : null,
    flag = data.sl_no > 0 ? 1 : 0;
    
  var resDt = await Api_Insert( pax_id, table_name, fields, fieldIndex, values, where, flag );
// var resDt = await saveAboutSection(data, user.USER_NAME, dateFormat(datetime, "dd-mmm-yy"), user.BANK_ID)
//   res.send(resDt);
if (resDt.suc > 0) {
    req.session.message = {
      type: "success",
      message: "Successfully Saved",
    };
    res.redirect("/admin/entry_about");
    // res_dt = { suc: 1, msg: resDt.msg };
  } else {
    // res_dt = { suc: 0, msg: "You have entered a wrong PIN" };
    req.session.message = {
      type: "danger",
      message: "Data Not Inserted!!",
    };
    res.redirect("/admin/entry_about");
  }
})

module.exports = {AboutRouter}