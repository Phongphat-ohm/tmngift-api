const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
var base64 = require('base-64');
const fetch = require('cross-fetch');

const PhFunc = require('./GetApi.js');

function generateAPIKey() {
    var charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    var apiKey = "";
  
    for (var i = 0; i < 32  ; i++) {
        var randomIndex = Math.floor(Math.random() * charset.length);
        apiKey += charset.charAt(randomIndex);
    }
  
    return apiKey;
}

async function topup(c, p){
    const Tmn = await PhFunc(c, p);
    let response;

    switch (Tmn.status.code){
        case "SUCCESS":
            response = {
                Status: 200,
                Message: "กดลิ้งค์สำเร็จ",
                Amount: PHClass.data.my_ticket.amount_baht
            };
            return response;
        case "CANNOT_GET_OWN_VOUCHER":
            response = {
                Status: 401,
                Message: "รับซองตัวเองไม่ได้",
                Amount: null
            };
            return response;
        case "TARGET_USER_NOT_FOUND":
            response = {
                Status: 404,
                Message: "ไม่พบเบอร์นี้ในระบบ",
                Amount: null
            };
            return response;
        case "INTERNAL_ERROR":
            response = {
                Status: 404,
                Message: "ไม่มีซองนี้ในระบบ หรือ URL ผิด",
                Amount: null
            };
            return response;
        case "VOUCHER_OUT_OF_STOCK":
            response = {
                Status: 409,
                Message: "มีคนรับไปแล้ว",
                Amount: null
            };
            return response;
        case "VOUCHER_NOT_FOUND":
            response = {
                Status: 404,
                Message: "ไม่พบซองในระบบ",
                Amount: null
            };
            return response;
        case "VOUCHER_EXPIRED":
            response = {
                Status: 410,
                Message: "ซองวอเลทนี้หมดอายุแล้ว",
                Amount: null
            };
            return response;
        default:
            break;
  }
}

app.post('/api/phfunc', (req, res) => {
    const Username = req.query.Username;
    const Encode = req.query.Encode;
    const Api_Key = req.query.Api_Key;
    const Code = req.query.Code;
  
    fetch("https://sheet.best/api/sheets/4d869100-f146-4811-9aa8-fac4d7b29e21")
    .then((response) => response.json())
    .then((data) => {
        // กำหนดเงื่อนไขในการกรองข้อมูล
        const condition = {
            Username: Username,
            Encode: Encode,
            Api_Key: Api_Key
        };
  
        // กรองข้อมูลที่ตรงกับเงื่อนไข
        const filteredData = data.filter(item => {
            for (const key in condition) {
                if (item[key] !== condition[key]) {
                    return false;
                }
            }
            return true;
        });
  
        let response;
  
        if (filteredData.length === 0) {
            response = {
                Status: 400,
                Message: "เข้าสู่ระบบไม่สำเร็จ"
            };
            res.send(response);
        } else {
            topup(Code, data[0].Phone_Number).then(result=>{
                response = result;
                res.send(response);
            }).catch(err=>{
                console.log(err);
            })
        }
      })
    .catch((error) => {
        console.error(error);
        let responce;
        responce = {
            Status: 500,
            Message: "เกิดข้อผิดพลาดในการดึงข้อมูล"
        }
        res.status(500).send(responce);
    });
});

app.get('/encode/:p', (req, res)=>{
    const encode = base64.encode(req.params.p);
    const responce = {
        "Encode": encode
    };

    res.send(responce);
})

app.listen(7879, ()=>{
    console.log("listen On Port 7879");
})