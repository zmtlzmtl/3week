// 모듈을 가져오고 가져온 모듈을 바탕으로 서버를 app에서 http로 변경을 하고
// io라는 변수에다가 소켓을 만들고 난 다음 io를 통해서 사용자가 접속을 하면
// 해당하는 이벤트가 실행되도록
const express = require("express"); //1. exprss 모델을 불러오기
const { Server } = require("http"); // 1. http 모듈 불러오기
const socketIo = require("socket.io"); // 1. Socket 모듈 불러오기

const cookieParser = require("cookie-parser");
const goodsRouter = require("./routes/goods.js");
const usersRouter = require("./routes/users.js");
const authRouter = require("./routes/auth.js");
const connect = require("./schemas");

const app = express();
const http = Server(app); // 2. express app을 http 서버로 감싸도록 구성 
const io = socketIo(http); // 3. http 객체를 Socket.io 모듈에 넘겨서 소켓 핸들러 생성
const port = 3000;

connect(); // mongoose를 연결합니다.

// 4. 소켓 연결 이벤트 핸들링
io.on("connection", (sock) => {  //Socket이 접속했을 때 , 해당하는 콜백 함수가 실행된다.
  console.log("새로운 소켓이 연결됐어요!");
   
  
  //클라이언트가 상품을 구매했을때 발생하는 이벤트
  sock.on("BUY", (data) => {
    const emitData = {
      nickname: data.nickname,
      goodsId: data.goodsId,
      goodsName: data.goodsName,
      date: new Date().toISOString(),
    };
  //클라이언트가 구매한 정보를 바탕으로 buy_goods 메세지전달
    io.emit("BUY_GOODS", emitData);  //소켓에 접속한 모슨 사용자에게 io.emit

  });

  sock.on("disconnect", () => {  //여기서 'disconnect'는 이벤트 명이라 한다.
    console.log(sock.id, "연결이 끊어졌어요!");
  });
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static("assets"));
app.use("/api", [goodsRouter, usersRouter, authRouter]);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// 5. app 대신 http 객체로 서버 열기
http.listen(port, () => {
  console.log(port, "포트로 서버가 열렸어요!");
});




