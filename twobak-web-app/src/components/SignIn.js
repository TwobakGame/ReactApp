import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { call } from '../api/Api';

// TODO remove, this demo shouldn't need to reset the theme.

const defaultTheme = createTheme();

export default function SignIn() {

  const [autoLogin, setAutoLogin] = React.useState(false);

  const handleAutoLogin = () => {
    setAutoLogin(!autoLogin);
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const SignInDTO = {
      userid: data.get('userid'),
      password: data.get('password'),
    }

    call("/users/login/", "POST", SignInDTO).then(
      (response) => {
        if(response.AccessToken !== undefined) {
          if (autoLogin) {
            const expirationDate = new Date();
            expirationDate.setDate(expirationDate.getDate() + 7);
  
            const cookieString = `Authorization=Bearer ${response.AccessToken}; expires=${expirationDate.toUTCString()}; path=/`;
  
            document.cookie = cookieString;
          }
          else {
            const cookieString = `Authorization=Bearer ${response.AccessToken}; path=/`;
  
            document.cookie = cookieString;
          }
          window.location.href = "/";
        }
        else {
          alert("로그인 실패");
        }

      }
    )
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            로그인
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="userid"
              label="Id"
              name="userid"
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
            />
            <FormControlLabel
              control={<Checkbox value="remember" color="primary" checked={autoLogin} onChange={handleAutoLogin} />}
              label="자동 로그인"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              로그인
            </Button>
            <Grid container>
              <Grid item>
                <Link href="/signup" variant="body2">
                  {"아이디가 없으면? 회원가입하러 가기"}
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}