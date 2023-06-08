const req = require('axios');

const PhFunc = async (a, p) => {
    // แยกตัวรหัส Gift
    a = a.replace("https://gift.truemoney.com/campaign/?v=", "");
    
    // ตั้งค่า API
    const config = {
        method: 'post',
        url: `https://gift.truemoney.com/campaign/vouchers/${a}/redeem`,
        data: { "mobile": `${p}` },
        headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.105 Safari/537.36 Edg/84.0.522.52",
        "Content-Type": "application/json",
        },
        httpsAgent: new require("https").Agent({ maxVersion: 'TLSv1.3', minVersion: 'TLSv1.3' }),
    };
    
    // ขอ request จาก api
    a = await req(config).then((r) => {
        return r.data;
    }).catch((e) => {
        return e.response.data;
    });
    
    // ส่งค่าออกมานอก function
    return a;
};

module.exports = PhFunc;