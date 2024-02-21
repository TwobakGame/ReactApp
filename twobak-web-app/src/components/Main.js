import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import CssBaseline from '@mui/material/CssBaseline';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import { Modal, TextField } from '@mui/material';
import { createTheme, keyframes, ThemeProvider } from '@mui/material/styles';
import '../css/main.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { modalStyle } from '../Style';
import { alpha, getContrastRatio } from '@mui/material/styles';
import { call } from '../api/Api';

const greenBase = '#5ED540';
const greenMain = alpha(greenBase, 0.7);
const was = process.env.REACT_APP_WAS_ADDRESS;

const theme = createTheme({
  palette: {
    green: {
      main: greenMain,
      light: alpha(greenBase, 0.5),
      dark: alpha(greenBase, 0.9),
      contrastText: getContrastRatio(greenBase, '#fff') > 4.5 ? '#fff' : '#111',
    },
    green2: {
      main: '#318F23'
    }
  },
});


export default function Main() {

  const [unloginedModal, setUnloginedModal] = useState(false);
  const [nameModal, setNameModal] = useState(false);
  const [roomNumberModal, setRoomNumberModal] = useState(false);
  const [login, setLogin] = useState(false);
  const [rows, setRows] = useState([]);
  const navigate = useNavigate();
  const nameRef = React.useRef('');
  const roomNumberRef = React.useRef('');


  React.useEffect(() => {
    const cookieString = document.cookie;

    const isTokenExists = cookieString.includes("Authorization");

    call("/rooms/allinquiry/", "GET").then((response) => {
      if (response.resultcode === "SUCCESS") {
        let temp_rows = [];
        for (let str of response.data) {
          const arr = str.split(':');
          const room = {
            name: arr[0],
            code: arr[2],
            people: arr[1]
          }
          temp_rows.push(room);
        }
        setRows(temp_rows);
      }
      else {
        console.log("방 목록 조회 실패");
      }
    })


    if (isTokenExists) {
      setLogin(true);
    }
  }, []);

  // TODO remove, this demo shouldn't need to reset the theme.
  const defaultTheme = createTheme();

  const handleRoom = () => {
    if (login) {
      handleNameModal();
    }
    else {
      handleUnloginedModal();
    }
  }

  const makeGame = () => {

    const roomName = nameRef.current.value;
    const nickName = "익명";

    call("/rooms/make/", "POST", { roomName: roomName })
      .then((response) => {
        if (response.resultcode === "SUCCESS") {
          const roomNumber = response.data.roomNum;
          navigate(`gamemanager/${roomNumber}`, { state: { nickName: nickName } });
        }
        else {
          alert('다시 시도해주세요.');
        }

      });


  }

  const joinGame = () => {
    const roomNumber = roomNumberRef.current.value;
    call(`/rooms/inquiry/?roomNum=${roomNumber}`, "GET").then((response) => {
      if(response.resultcode === "SUCCESS") {
        navigate(`gameclient/${roomNumber}`);
      }
      else {
        alert("입장 불가능한 방입니다.");
        window.location.href = "/";
      }
    })
    

  }

  const joinGameByClick = (code) => {
    call(`/rooms/inquiry/?roomNum=${code}`, "GET").then((response) => {
      if(response.resultcode === "SUCCESS") {
        navigate(`gameclient/${code}`);
      }
      else {
        alert("입장 불가능한 방입니다.");
        window.location.href = "/";
      }
    })
  }

  const handleUnloginedModal = () => {
    setUnloginedModal(!unloginedModal);
  }

  const handleNameModal = () => {
    setUnloginedModal(false);
    setNameModal(!nameModal);
  }

  const handleRoomNumberModal = () => {
    setRoomNumberModal(!roomNumberModal);
  }

  const signOut = () => {
    const currentDate = new Date();

    document.cookie = "token=; expires=" + currentDate.toUTCString() + "; path=/";
    setLogin(false);
  }


  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static" color='green'>
          <Toolbar className='main-toolbar' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className='game-title'>
              <a href='/'>투박게임</a>
              <a href='/ranking' className='ranking-tab-a'>랭킹</a>
            </div>

            <div className='login-div'>
              {
                login ?
                  <Button color="inherit" onClick={() => { signOut() }}>로그아웃</Button>
                  :
                  <>
                    <Button color="inherit" href="/signin">로그인</Button>
                    <Button color="inherit" href="/signup">회원가입</Button>
                  </>
              }
            </div>
          </Toolbar>
        </AppBar>
      </Box>
      <main>
        {/* Hero unit */}
        <Box
          sx={{
            bgcolor: 'background.paper',
            pt: 8,
            pb: 6,
          }}
        >
          <Container maxWidth="sm">
            <div className='image-div'>
              <img className='twobak-img' src="/image/logo.png" width='200' />
            </div>
            <Typography variant="h5" align="center" color="text.secondary" paragraph>
              친구와 함께 즐기는 수박게임
            </Typography>
            <Stack
              sx={{ pt: 4 }}
              direction="row"
              spacing={2}
              justifyContent="center"
            >
              <Button variant="contained" onClick={() => { handleRoom() }} color='green'>방 만들기</Button>
              <Button variant="outlined" onClick={() => { handleRoomNumberModal() }} color='green2'>코드로 참여하기</Button>
            </Stack>
          </Container>
        </Box>
        <Container sx={{ py: 8 }} maxWidth="md">
          {/* End hero unit */}
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>제목</TableCell>
                  <TableCell align="right">코드</TableCell>
                  <TableCell align="right">인원수</TableCell>
                  <TableCell align="right"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow
                    key={row.code}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {row.name}
                    </TableCell>
                    <TableCell align="right">{row.code}</TableCell>
                    <TableCell align="right">{row.people}</TableCell>
                    <TableCell align="right"><button className="join-button" onClick={() => { joinGameByClick(row.code) }}>Join</button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Container>
      </main>
      {/* Footer */}
      <div>
        <Modal
          open={unloginedModal}
          onClose={handleUnloginedModal}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={modalStyle}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              비회원
            </Typography>
            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
              방장 비로그인 이용 시 랭킹에 기록되지 않습니다.
            </Typography>
            <Button className="apply-button" onClick={() => { handleNameModal() }}>계속</Button>
            <button className="reject-button" onClick={() => { handleUnloginedModal() }}>나가기</button>
          </Box>
        </Modal>
      </div>
      <div>
        <Modal
          open={nameModal}
          onClose={handleNameModal}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={modalStyle}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              제목을 입력해주세요.
            </Typography>
            <TextField fullWidth label="방 제목" id="fullWidth" inputRef={nameRef} />
            <Button className="apply-button" onClick={() => { makeGame() }}>방 만들기</Button>
            <button className="reject-button" onClick={() => { handleNameModal() }}>나가기</button>
          </Box>
        </Modal>
      </div>
      <div>
        <Modal
          open={roomNumberModal}
          onClose={handleRoomNumberModal}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={modalStyle}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              방 번호를 입력해주세요.
            </Typography>
            <TextField fullWidth label="방 번호" id="fullWidth" inputRef={roomNumberRef} />
            <Button className="apply-button" onClick={() => { joinGame() }}>입장</Button>
            <button className="reject-button" onClick={() => { handleRoomNumberModal() }}>나가기</button>
          </Box>
        </Modal>
      </div>
      {/* End footer */}
    </ThemeProvider>
  );
}