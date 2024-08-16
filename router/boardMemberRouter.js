const boardMembRouter = require('express').Router(),
{ F_Select, Api_Insert, F_Delete } = require("../controller/masterController"),
dateFormat = require('dateformat');

boardMembRouter.get('/board_member', async (req, res) => {
    var user = req.session.user,
    data = req.query;
    var pax_id = user.BANK_ID,
        fields = "*",
        table_name = `MD_BOARD_MEMB`,
        where = `bank_id=${user.BANK_ID} ${data.sl_no > 0 ? `SL_NO = ${data.sl_no}` : ''}`,
        order = null,
        flag = 1;
    var resDt = await F_Select(pax_id, fields, table_name, where, order, flag)
    var viewData = {heading: "Board Member", res_dt: resDt.suc > 0 ? resDt.msg : []}
    res.render('board_memb/view', viewData)
})

boardMembRouter.get('/board_member_edit', async (req, res) => {
    var user = req.session.user,
    data = req.query;
    var resDt = {suc: 0}
    if(data.id > 0){
        var pax_id = user.BANK_ID,
            fields = "*",
            table_name = `MD_BOARD_MEMB`,
            where = `bank_id=${user.BANK_ID} ${data.id > 0 ? `AND SL_NO = ${data.id}` : ''}`,
            order = null,
            flag = 0;
        resDt = await F_Select(pax_id, fields, table_name, where, order, flag)
    }
    var viewData = {heading: "Board Member", res_dt: resDt.suc > 0 ? resDt.msg : null}
    res.render('board_memb/add', viewData)
})

boardMembRouter.post("/board_member_edit", async (req, res) => {
    var data = req.body;
    var datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss"),
      user = req.session.user.USER_NAME,
      id = data.sl_no;
    var pax_id = req.session.user.BANK_ID,
      table_name = "MD_BOARD_MEMB",
      fields =
        id > 0
          ? "MEMB_NAME = :0, PHONE_NO = :1, EMAIL_ID = :2, MODIFIED_BY = :3, MODIFIED_DT = :4"
          : "SL_NO, MEMB_NAME, PHONE_NO, EMAIL_ID, CREATED_BY, CREATED_DT, BANK_ID",
      fieldIndex = `((SELECT CASE WHEN MAX(SL_NO) > 0 THEN MAX(SL_NO) ELSE 0 END + 1 FROM MD_BOARD_MEMB), :0, :1, :2, :3, :4, :5)`,
      values = id > 0 ? [
        data.memb_name,
        data.phone_no,
        data.email_id,
        user,
        dateFormat(datetime, "dd-mmm-yy")
      ] : [
        data.memb_name,
        data.phone_no,
        data.email_id,
        user,
        dateFormat(datetime, "dd-mmm-yy"),
        req.session.user.BANK_ID
      ],
      where = id > 0 ? `SL_NO = ${id}` : null,
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
      res.redirect("/admin/board_member");
      // res_dt = { suc: 1, msg: resDt.msg };
    } else {
      // res_dt = { suc: 0, msg: "You have entered a wrong PIN" };
      req.session.message = {
        type: "danger",
        message: "Data Not Inserted!!",
      };
      res.redirect("/admin/board_member_edit?id=" + id);
    }
});

boardMembRouter.get('/board_member_delete', async (req, res) => {
    var id = req.query.id,
    user = req.session.user;
    console.log(id);
    var resDt = await F_Delete(user.BANK_ID, 'MD_BOARD_MEMB', `SL_NO = '${id}'`);
    if (resDt.suc > 0) {
      req.session.message = {
        type: "success",
        message: "Successfully Deleted",
      };
      res.redirect("/admin/board_member");
    //   // res_dt = { suc: 1, msg: resDt.msg };
    } else {
      // res_dt = { suc: 0, msg: "You have entered a wrong PIN" };
      req.session.message = {
        type: "danger",
        message: "Please try again later!!",
      };
      res.redirect("/admin/board_member");
    }
})

module.exports = {boardMembRouter}