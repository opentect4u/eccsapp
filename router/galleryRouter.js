const galleryRouter = require('express').Router(),
{ F_Select, F_Insert, Api_Insert } = require("../controller/masterController"),
upload = require('express-fileupload'),
dateFormat = require('dateformat');
require('dotenv').config();

galleryRouter.use(upload());

galleryRouter.get('/img_gallery', async (req, res) => {
    var user = req.session.user
    var pax_id = user.BANK_ID,
        fields = "*",
        table_name = `TD_IMG_GALLERY`,
        where = `bank_id=${user.BANK_ID}`,
        order = null,
        flag = 1;
    var resDt = await F_Select(pax_id, fields, table_name, where, order, flag)
    var viewData = {header: "Image Gallery", gallery: resDt.suc > 0 ? resDt.msg : [], baseUrl: process.env.BASE_URL}
    res.render('gallery/view', viewData)
})

galleryRouter.get('/save_img', async (req, res) => {
    var viewData = {header: "Add Image Gallery"}
    res.render('gallery/add', viewData)
})

galleryRouter.post('/save_img', async (req, res) => {
    var img = req.files ? req.files.img : null,
    data = req.body,
    user = req.session.user;
    if(img){
        var fileName = `${user.BANK_ID}_${img.name}`;

        img.mv('assets/uploads/img_gallery/' + fileName, async (err) => {
            if (err) {
                console.log(`${fileName} not uploaded`);
                res.send({suc: 0, msg: err})
            } else {
                console.log(`Successfully ${fileName} uploaded`);
                // await SectionImageSave(data, filename);
                var pax_id = user.BANK_ID,
                table_name = "TD_IMG_GALLERY",
                fields =
                data.sl_no > 0
                    ? "IMG_TITLE = :1, IMG_URL = :2, MODIFIED_BY = :3, MODIFIED_DT = :4"
                    : "SL_NO, BANK_ID, IMG_TITLE, IMG_URL, CREATED_BY, CREATED_DT",
                fieldIndex = `((SELECT MAX(SL_NO)+1 FROM TD_IMG_GALLERY), :0, :1, :2, :3, :4)`,
                values = [
                    user.BANK_ID,
                    data.img_title,
                    `uploads/img_gallery/${fileName}`,
                    user.USER_NAME,
                    dateFormat(new Date(), "dd-mmm-yy"),
                ],
                where = data.sl_no > 0 ? `SL_NO = ${data.sl_no}` : null,
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
                if (resDt.suc > 0) {
                    req.session.message = {
                      type: "success",
                      message: "Successfully Saved",
                    };
                    res.redirect("/admin/img_gallery");
                    // res_dt = { suc: 1, msg: resDt.msg };
                  } else {
                    // res_dt = { suc: 0, msg: "You have entered a wrong PIN" };
                    req.session.message = {
                      type: "danger",
                      message: "Data Not Inserted!!",
                    };
                    res.redirect("/admin/img_gallery");
                }
            }
        })
    }else{
        res.send({suc: 0, msg: "No file selected"})
    }
})

module.exports = {galleryRouter}