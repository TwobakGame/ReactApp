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


export default function Ranking() {

  const [login, setLogin] = useState(false);
  const [rows, setRows] = useState([]);
  const navigate = useNavigate();

  React.useEffect(() => {
    const cookieString = document.cookie;

    const isTokenExists = cookieString.includes("Authorization");

    call("/users/rank/", "GET").then((response) => {
      if(response.resultcode === "SUCCESS") {
        let rows = [];
        let rank = 1;
        for(let row of response.data) {
          rows.push({
            rank : rank,
            name : row.user__nickname,
            score : row.score,
          })
          rank++;
        }

        setRows(rows);
      }
    })

    if (isTokenExists) {
      setLogin(true);
    }
  }, []);

  // TODO remove, this demo shouldn't need to reset the theme.
  const defaultTheme = createTheme();

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
          </Container>
        </Box>
        <Container sx={{ py: 8 }} maxWidth="md">
          {/* End hero unit */}
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>순위</TableCell>
                  <TableCell align="right">닉네임</TableCell>
                  <TableCell align="right">점수</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow
                    key={row.rank}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {row.rank}
                    </TableCell>
                    <TableCell align="right">{row.name}</TableCell>
                    <TableCell align="right">{row.score}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Container>
      </main>
    </ThemeProvider>
  );
}