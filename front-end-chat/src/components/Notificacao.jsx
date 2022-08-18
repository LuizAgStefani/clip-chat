import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

function notificacao(textoMensagem, tipoMensagem, backgroundColor, color) {
  const MySwal = withReactContent(Swal);

  return MySwal.fire({
    toast: true,
    position: "top-end",
    title: textoMensagem,
    icon: tipoMensagem,
    timer: 4000,
    timerProgressBar: true,
    showConfirmButton: false,
    background: backgroundColor,
    color: color,
    iconColor: color,
    didOpen: (toast) => {
      toast.addEventListener("mouseenter", Swal.stopTimer);
      toast.addEventListener("mouseleave", Swal.resumeTimer);
      toast.addEventListener("mousedown", Swal.close);
    },
  });
}

export function notificacaoSucesso(textoMensagem) {
  return notificacao(textoMensagem, "success", "green", "white");
}

export function notificacaoErro(textoMensagem) {
  return notificacao(textoMensagem, "error", "#ff3333", "white");
}

export function notificacaoInfo(textoMensagem) {
  return notificacao(textoMensagem, "info", "#0288d1", "white");
}

export function notificacaoWarning(textoMensagem) {
  return notificacao(textoMensagem, "warning", "#ffbf00", "black");
}
