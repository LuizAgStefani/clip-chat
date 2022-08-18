import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { Card, Container, Content, MyMessage, OtherMessage } from "./styles";
import { v4 as uuidv4 } from "uuid";
import * as notificacao from "../components/Notificacao";
import Logo from "../assets/clipcloud_logo.png";

const socket = io("http://10.30.101.6:3333");

const Home = () => {
  const [title] = useState("ClipChat");
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [loginFeito, setLoginFeito] = useState(false);
  const [login, setLogin] = useState("");
  const [socketId, setSocketId] = useState("");
  const [usuarios, setUsuarios] = useState([]);
  const [userReceiver, setUserReceiver] = useState("");
  const [enviarGeral, setEnviarGeral] = useState(false);

  const mensagems = useRef(null);

  socket.on("msgToClient", (message, id) => {
    console.log(message);
    receivedMessage(message);
  });

  function receivedMessage(message) {
    console.log(messages);
    const newMessage = {
      id: uuidv4(),
      name: message.name,
      text: message.text,
    };
    setMessages([...messages, newMessage]);
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    socket.on("connect", () => {
      setSocketId(socket.id);
    });

    socket.on("logoutMsg", (name) => {
      notificacao.notificacaoErro(`O usuário ${name} foi deslogado`);
    });

    socket.on("users", (users) => {
      notificacao.notificacaoSucesso(
        `O usuário ${users[users.length - 1].username} está online`
      );
      setUsuarios(users.filter((user) => user.id !== socketId));
      if (users.filter((user) => user.id !== socketId).length === 1) {
        setUserReceiver(users[0].id);
      }
    });
  }, [socketId]);

  //   console.log("Renderizou");

  function validadeInput() {
    return text.length > 0;
  }

  function sendMessage() {
    console.log(enviarGeral);
    if (validadeInput()) {
      if (enviarGeral) {
        socket.emit("msgToServerGeral", { mensagem: text });
      } else {
        socket.emit("msgToServer", { mensagem: text, id: userReceiver });
      }

      setText("");
    }
  }

  const scrollToBottom = () => {
    mensagems.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {loginFeito ? (
        <Container>
          <Content>
            <div
              style={{
                display: "flex",
                marginBottom: "1em",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <img
                style={{
                  width: "90px",
                  height: "90px",
                  borderRadius: "90px",
                  border: "2px solid #000",
                }}
                src={Logo}
                alt="Logo Sistema"
              />
              <h1 style={{ marginRight: "6em" }}>{title}</h1>
            </div>
            <select
              value={userReceiver}
              onChange={(e) => setUserReceiver(e.target.value)}
            >
              {usuarios.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username}
                </option>
              ))}
            </select>
            <Card>
              <ul>
                {messages.map((message) => {
                  if (message.name === login) {
                    return (
                      <MyMessage key={message.id}>
                        <span>
                          {message.name}
                          {" diz:"}
                        </span>
                        <p>{message.text}</p>
                      </MyMessage>
                    );
                  }

                  return (
                    <OtherMessage key={message.id}>
                      <span>
                        {message.name}
                        {" diz:"}
                      </span>
                      <p>{message.text}</p>
                    </OtherMessage>
                  );
                })}
                <div ref={mensagems} />
              </ul>
            </Card>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage();
                }
              }}
              placeholder="Digite sua Mensagem"
            />
            <div style={{ display: "flex", alignItems: "center" }}>
              <input
                checked={enviarGeral}
                value={enviarGeral}
                onChange={(e) => setEnviarGeral(e.target.checked)}
                type="checkbox"
                id="msgGeral"
                style={{ marginRight: "0.4em" }}
              />
              <label style={{ marginTop: "0.5em" }} htmlFor="msgGeral">
                Enviar mensagem para todos online
              </label>
            </div>
            <button type="button" onClick={sendMessage}>
              Enviar
            </button>
          </Content>
        </Container>
      ) : (
        <Container>
          <Content>
            <h1 style={{ textAlign: "center" }}>Fazer Login</h1>
            <input
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="Informe seu Nome"
            />
            <button
              type="button"
              onClick={() => {
                if (login !== "") {
                  socket.emit("login", login);
                  setLoginFeito(true);
                }
              }}
            >
              Enviar
            </button>
          </Content>
        </Container>
      )}
    </>
  );
};

export default Home;
