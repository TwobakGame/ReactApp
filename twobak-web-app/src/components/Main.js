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




export default function Main() {

  const [unloginedModal, setUnloginedModal] = useState(false);
  const [nameModal, setNameModal] = useState(false);
  const [roomNumberModal, setRoomNumberModal] = useState(false);
  const [login, setLogin] = useState(false);
  const navigate = useNavigate();
  const nameRef = React.useRef('');
  const roomNumberRef = React.useRef('');

  function Copyright() {
    return (
      <Typography variant="body2" color="text.secondary" align="center">
        {'Copyright © '}
        <Link color="inherit" href="https://mui.com/">
          Your Website
        </Link>{' '}
        {new Date().getFullYear()}
        {'.'}
      </Typography>
    );
  }

  //WAS로부터 방 대기열 받아와서 대체할 것
  const rows = [
    { name: 'Frozen yoghurt', play: '대기 중' },
    { name: 'Frozen yoghurt', play: '대기 중' },
    { name: 'Frozen yoghurt', play: '대기 중' },
    { name: 'Frozen yoghurt', play: '대기 중' },
  ];
  // TODO remove, this demo shouldn't need to reset the theme.
  const defaultTheme = createTheme();

  const handleRoom = () => {
    if(login) {
      handleNameModal();
    }
    else {
      handleUnloginedModal();
    }
  }

  const makeGame = () => {
    //alert(nameRef.current.value); //제목 제출하기
    const roomNumber = 1234;  //WAS -> redis 확인해서 중복되지 않는 방번호 요청할것
  
    navigate(`gamemanager/${roomNumber}`);
  }

  const joinGame = () => {
    navigate(`gameclient/${roomNumberRef.current.value}`);
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


  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <AppBar position="relative">
        <Toolbar>
          <Typography variant="h6" color="inherit" noWrap>
            투박게임
          </Typography>
        </Toolbar>
      </AppBar>
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
            <Typography
              component="h1"
              variant="h2"
              align="center"
              color="text.primary"
              gutterBottom
            >
              투박게임
            </Typography>
            <Typography variant="h5" align="center" color="text.secondary" paragraph>
              친구와 함께 즐기는 수박게임
            </Typography>
            <Stack
              sx={{ pt: 4 }}
              direction="row"
              spacing={2}
              justifyContent="center"
            >
              <Button variant="contained"  onClick={() => {handleRoom()}}>방 만들기</Button>
              <Button variant="outlined" onClick={() => {handleRoomNumberModal()}}>코드로 참여하기</Button>
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
                  <TableCell align="right">진행</TableCell>
                  <TableCell align="right"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow
                    key={row.name}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {row.name}
                    </TableCell>
                    <TableCell align="right">{row.play}</TableCell>
                    <TableCell align="right"><button className="join-button">Join</button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Container>
      </main>
      {/* Footer */}
      <Box sx={{ bgcolor: 'background.paper', p: 6 }} component="footer">
        <Typography variant="h6" align="center" gutterBottom>
          Footer
        </Typography>
        <Typography
          variant="subtitle1"
          align="center"
          color="text.secondary"
          component="p"
        >
          Something here to give the footer a purpose!
        </Typography>
        <Copyright />
      </Box>

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
            <Button className="apply-button" onClick={() => {handleNameModal()}}>계속</Button>
            <button className="reject-button" onClick={() => {handleUnloginedModal()}}>나가기</button>
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
            <TextField fullWidth label="방 제목" id="fullWidth" inputRef={nameRef}/>
            <Button className="apply-button" onClick={() => {makeGame()}}>방 만들기</Button>
            <button className="reject-button" onClick={() => {handleNameModal()}}>나가기</button>
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
            <TextField fullWidth label="방 번호" id="fullWidth" inputRef={roomNumberRef}/>
            <Button className="apply-button" onClick={() => {joinGame()}}>입장</Button>
            <button className="reject-button" onClick={() => {handleRoomNumberModal()}}>나가기</button>
          </Box>
        </Modal>
      </div>
      {/* End footer */}
    </ThemeProvider>
  );
}