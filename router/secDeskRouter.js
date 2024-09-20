const SecDeskRouter = require('express').Router()
const { ABOUT_TYPE_LIST } = require('../model/masterModel')
const {F_Select, Api_Insert, saveAboutSection, F_Delete} = require('../controller/masterController'),
dateFormat = require('dateformat'),
oracledb = require("oracledb");

SecDeskRouter.get('/sec_desk', async (req, res) => {
    var user = req.session.user,
    data = req.query;
    var pax_id = user.BANK_ID,
        fields = "*",
        table_name = `TD_SEC_DESK`,
        where = `bank_id=${user.BANK_ID} ${data.sl_no > 0 ? `SL_NO = ${data.sl_no}` : ''}`,
        order = null,
        flag = 1;
    var resDt = await F_Select(pax_id, fields, table_name, where, order, flag)
    var viewData = {heading: "Secretary's Desk", res_dt: resDt.suc > 0 ? resDt.msg : [], dateFormat}
    res.render('sec_desk/view', viewData)
})

SecDeskRouter.get('/sec_desk_edit', async (req, res) => {
    var user = req.session.user,
    data = req.query;
    var resDt = {suc: 0}
    if(data.id > 0){
        var pax_id = user.BANK_ID,
            fields = "*",
            table_name = `TD_SEC_DESK`,
            where = `bank_id=${user.BANK_ID} ${data.id > 0 ? `AND SL_NO = ${data.id}` : ''}`,
            order = null,
            flag = 0;
        resDt = await F_Select(pax_id, fields, table_name, where, order, flag)
    }
    var viewData = {heading: "Secretary's Desk", res_dt: resDt.suc > 0 ? resDt.msg : null}
    res.render('sec_desk/add', viewData)
})

SecDeskRouter.post("/sec_desk_edit", async (req, res) => {
    var data = req.body;
    var datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss"),
      user = req.session.user.USER_NAME,
      id = data.sl_no;

    var sql_data = {}
    if(id > 0){
        sql_data = {
            narration: { val: data.narration, type: oracledb.STRING },
            pub_flag: { val: data.pub_flag, type: oracledb.STRING },
            pub_st_dt: { val: new Date(data.pub_st_dt), type: oracledb.DATE },
            pub_end_dt: { val: new Date(data.pub_end_dt), type: oracledb.NUMBER },
            modifiedBy: { val: user, type: oracledb.STRING },
            modifiedDt: { val: new Date(datetime), type: oracledb.DATE },
            slNo: {val: parseInt(data.sl_no), type: oracledb.NUMBER}
        }
    }else{
        sql_data = {
            narration: { val: data.narration, type: oracledb.STRING },
            pub_flag: { val: data.pub_flag, type: oracledb.STRING },
            pub_st_dt: { val: new Date(data.pub_st_dt), type: oracledb.DATE },
            pub_end_dt: { val: new Date(data.pub_end_dt), type: oracledb.DATE },
            modifiedBy: { val: user, type: oracledb.STRING },
            modifiedDt: { val: new Date(datetime), type: oracledb.DATE },
            bank_id: {val: parseInt(req.session.user.BANK_ID), type: oracledb.NUMBER}
        }
    }
    var pax_id = req.session.user.BANK_ID,
      table_name = "TD_SEC_DESK",
      fields =
        id > 0
          ? "NARRATION = :narration, PUBLISH_FLAG = :pub_flag, PUBLISH_START_DT = :pub_st_dt, PUBLISH_END_DT = :pub_end_dt, MODIFIED_BY = :modifiedBy, MODIFIED_DT = :modifiedDt"
          : "SL_NO, NARRATION, PUBLISH_FLAG, PUBLISH_START_DT, PUBLISH_END_DT, CREATED_BY, CREATED_DT, BANK_ID",
      fieldIndex = `((SELECT CASE WHEN MAX(SL_NO) > 0 THEN MAX(SL_NO) ELSE 0 END + 1 FROM TD_SEC_DESK), :narration, :pub_flag, :pub_st_dt, :pub_end_dt, :modifiedBy, :modifiedDt, :bank_id)`,
        values = sql_data,
      where = id > 0 ? `SL_NO = :slNo` : null,
      flag = id > 0 ? 1 : 0;
    var resDt = await Api_Insert(
      pax_id,
      table_name,
      fields,
      fieldIndex,
      values,
      where,
      flag
    );
    if (resDt.suc > 0) {
      req.session.message = {
        type: "success",
        message: "Successfully Saved",
      };
      res.redirect("/admin/sec_desk");
      // res_dt = { suc: 1, msg: resDt.msg };
    } else {
      // res_dt = { suc: 0, msg: "You have entered a wrong PIN" };
      req.session.message = {
        type: "danger",
        message: "Data Not Inserted!!",
      };
      res.redirect("/admin/sec_desk_edit?id=" + id);
    }
});

SecDeskRouter.get('/sec_desk_delete', async (req, res) => {
    var id = req.query.id,
    user = req.session.user;
    console.log(id);
    var resDt = await F_Delete(user.BANK_ID, 'TD_SEC_DESK', `SL_NO = '${id}'`);
    if (resDt.suc > 0) {
      req.session.message = {
        type: "success",
        message: "Successfully Deleted",
      };
      res.redirect("/admin/sec_desk");
    //   // res_dt = { suc: 1, msg: resDt.msg };
    } else {
      // res_dt = { suc: 0, msg: "You have entered a wrong PIN" };
      req.session.message = {
        type: "danger",
        message: "Please try again later!!",
      };
      res.redirect("/admin/sec_desk");
    }
})

module.exports = {SecDeskRouter}