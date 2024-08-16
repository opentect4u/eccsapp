const holidayHomeRouter = require('express').Router(),
{ F_Select, Api_Insert, F_Delete } = require("../controller/masterController"),
dateFormat = require('dateformat'),
oracledb = require("oracledb");

holidayHomeRouter.get('/holiday_home', async (req, res) => {
    var user = req.session.user,
    data = req.query;
    var pax_id = user.BANK_ID,
        fields = "*",
        table_name = `TD_HOLIDAY_HOME`,
        where = `bank_id=${user.BANK_ID} ${data.sl_no > 0 ? `SL_NO = ${data.sl_no}` : ''}`,
        order = null,
        flag = 1;
    var resDt = await F_Select(pax_id, fields, table_name, where, order, flag)
    var viewData = {heading: "Holiday Home", res_dt: resDt.suc > 0 ? resDt.msg : []}
    res.render('holiday_home/view', viewData)
})

holidayHomeRouter.get('/holiday_home_edit', async (req, res) => {
    var user = req.session.user,
    data = req.query;
    var resDt = {suc: 0}
    if(data.id > 0){
        var pax_id = user.BANK_ID,
            fields = "*",
            table_name = `TD_HOLIDAY_HOME`,
            where = `bank_id=${user.BANK_ID} ${data.id > 0 ? `AND SL_NO = ${data.id}` : ''}`,
            order = null,
            flag = 0;
        resDt = await F_Select(pax_id, fields, table_name, where, order, flag)
    }
    var viewData = {heading: "Holiday Home", res_dt: resDt.suc > 0 ? resDt.msg : null}
    res.render('holiday_home/add', viewData)
})

holidayHomeRouter.post("/holiday_home_edit", async (req, res) => {
    var data = req.body;
    var datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss"),
      user = req.session.user.USER_NAME,
      id = data.sl_no;

    var sql_data = {}
    if(id > 0){
        sql_data = {
            home_name: { val: data.home_name, type: oracledb.STRING },
            location: { val: data.location, type: oracledb.STRING },
            price: { val: data.price, type: oracledb.STRING },
            rating: { val: parseFloat(data.rating), type: oracledb.NUMBER },
            descr: { val: data.desc, type: oracledb.STRING },
            no_of_bed: { val: parseInt(data.no_of_bed), type: oracledb.NUMBER },
            no_of_bath: { val: parseInt(data.no_of_bath), type: oracledb.NUMBER },
            no_of_floor: { val: parseInt(data.no_of_floor), type: oracledb.NUMBER },
            room_size: { val: parseInt(data.room_size), type: oracledb.NUMBER },
            modifiedBy: { val: user, type: oracledb.STRING },
            modifiedDt: { val: new Date(datetime), type: oracledb.DATE },
            slNo: {val: parseInt(data.sl_no), type: oracledb.NUMBER}
        }
    }else{
        sql_data = {
            home_name: { val: data.home_name, type: oracledb.STRING },
            location: { val: data.location, type: oracledb.STRING },
            price: { val: data.price, type: oracledb.STRING },
            rating: { val: parseFloat(data.rating), type: oracledb.NUMBER },
            descr: { val: data.desc, type: oracledb.STRING },
            no_of_bed: { val: parseInt(data.no_of_bed), type: oracledb.NUMBER },
            no_of_bath: { val: parseInt(data.no_of_bath), type: oracledb.NUMBER },
            no_of_floor: { val: parseInt(data.no_of_floor), type: oracledb.NUMBER },
            room_size: { val: parseInt(data.room_size), type: oracledb.NUMBER },
            modifiedBy: { val: user, type: oracledb.STRING },
            modifiedDt: { val: new Date(datetime), type: oracledb.DATE },
            bank_id: {val: parseInt(req.session.user.BANK_ID), type: oracledb.NUMBER},
            slNo: {val: parseInt(data.sl_no), type: oracledb.NUMBER}
        }
    }
    var pax_id = req.session.user.BANK_ID,
      table_name = "TD_HOLIDAY_HOME",
      fields =
        id > 0
          ? "HOME_NAME = :home_name, LOCATION = :location, PRICE = :price, RATING = :rating, DESCRIPTION = :descr, NO_OF_BED = :no_of_bed, NO_OF_BATH = :no_of_bath, NO_OF_FLOORS = :no_of_floor, ROOM_SIZE = :room_size, MODIFIED_BY = :modifiedBy, MODIFIED_DT = :modifiedDt"
          : "SL_NO, HOME_NAME, LOCATION, PRICE, RATING, DESCRIPTION, NO_OF_BED, NO_OF_BATH, NO_OF_FLOORS, ROOM_SIZE, CREATED_BY, CREATED_DT, BANK_ID",
      fieldIndex = `((SELECT CASE WHEN MAX(SL_NO) > 0 THEN MAX(SL_NO) ELSE 0 END + 1 FROM TD_HOLIDAY_HOME), :home_name, :location, :price, :rating, :descr, :no_of_bed, :no_of_bath, :no_of_floor, :room_size, :modifiedBy, :modifiedDt, :bank_id)`,
    //   values = [
    //     data.home_name,
    //     data.location,
    //     data.price,
    //     data.rating,
    //     data.desc,
    //     data.no_of_bed,
    //     data.no_of_bath,
    //     data.no_of_floor,
    //     data.room_size,
    //     user,
    //     dateFormat(datetime, "dd-mmm-yy"),
    //     req.session.user.BANK_ID,
    //     id,
    //   ],
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
      res.redirect("/admin/holiday_home");
      // res_dt = { suc: 1, msg: resDt.msg };
    } else {
      // res_dt = { suc: 0, msg: "You have entered a wrong PIN" };
      req.session.message = {
        type: "danger",
        message: "Data Not Inserted!!",
      };
      res.redirect("/admin/holiday_home_edit?id=" + id);
    }
});

holidayHomeRouter.get('/holiday_home_delete', async (req, res) => {
    var id = req.query.id,
    user = req.session.user;
    console.log(id);
    var resDt = await F_Delete(user.BANK_ID, 'TD_HOLIDAY_HOME', `SL_NO = '${id}'`);
    if (resDt.suc > 0) {
      req.session.message = {
        type: "success",
        message: "Successfully Deleted",
      };
      res.redirect("/admin/holiday_home");
    //   // res_dt = { suc: 1, msg: resDt.msg };
    } else {
      // res_dt = { suc: 0, msg: "You have entered a wrong PIN" };
      req.session.message = {
        type: "danger",
        message: "Please try again later!!",
      };
      res.redirect("/admin/holiday_home");
    }
})

module.exports = {holidayHomeRouter}