import React, { useContext, useState, useRef } from 'react';
import Styles from './ResetPassword.module.css';
import { useNavigate } from 'react-router-dom';
import { assets } from '../../assets/assets';
import { AppContext } from '../../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isOtpSubmitted, setIsOtpSubmitted] = useState(false);
  const [otp, setOtp] = useState('');
  const inputRefs = useRef([]);
  const { backendUrl } = useContext(AppContext);
  const navigate = useNavigate();

  axios.defaults.withCredentials = true;

  // Step 1: Submit Email
  const onSubmitEmail = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/send-reset-otp`, { email });
      if (data.status) {
        toast.success(data.message);
        setIsEmailSent(true);
      } else toast.error(data.message);
    } catch (err) {
      console.error(err);
      toast.error('Failed to send OTP');
    }
  };

  // Step 2: Verify OTP
  const onSubmitOtp = async (e) => {
    e.preventDefault();
    const enteredOtp = inputRefs.current.map((ref) => ref.value).join('');
    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/verify-reset-otp`, {
        email,
        otp: enteredOtp,
      });
      if (data.status) {
        toast.success(data.message);
        setOtp(enteredOtp);
        setIsOtpSubmitted(true);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error('OTP verification failed');
    }
  };

  // Step 3: Reset Password
  const onSubmitNewPassword = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/reset-password`, {
        email,
        otp,
        newPassword,
      });
      if (data.status) {
        toast.success(data.message);
        navigate('/login');
      } else toast.error(data.message);
    } catch (err) {
      console.error(err);
      toast.error('Failed to reset password');
    }
  };

  // OTP input handlers
  const handleInput = (e, index) => {
    if (e.target.value.length > 0 && index < 5) inputRefs.current[index + 1].focus();
  };
  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && e.target.value === '' && index > 0)
      inputRefs.current[index - 1].focus();
  };
  const handlePaste = (e) => {
    const paste = e.clipboardData.getData('text').slice(0, 6).split('');
    paste.forEach((char, index) => {
      if (inputRefs.current[index]) inputRefs.current[index].value = char;
    });
  };

  return (
    <div className={Styles.container}>
      <img onClick={() => navigate('/')} src={assets.logo} alt="logo" className={Styles.logo} />

      {!isEmailSent && (
        <form onSubmit={onSubmitEmail} className={Styles.form}>
          <h1>Reset Password</h1>
          <p>Enter your registered email address</p>
          <div className={Styles.subcon}>
            <img src={assets.mail_icon} alt="" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button className={Styles.btn}>Submit</button>
        </form>
      )}

      {isEmailSent && !isOtpSubmitted && (
        <form onSubmit={onSubmitOtp} className={Styles.form} onPaste={handlePaste}>
          <h1>Enter OTP</h1>
          <p>Enter the 6-digit OTP sent to your email</p>
          <div className={Styles.subcon2}>
            {Array(6)
              .fill(0)
              .map((_, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  ref={(el) => (inputRefs.current[index] = el)}
                  onInput={(e) => handleInput(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  required
                />
              ))}
          </div>
          <button className={Styles.btn}>Verify OTP</button>
        </form>
      )}

      {isEmailSent && isOtpSubmitted && (
        <form onSubmit={onSubmitNewPassword} className={Styles.form}>
          <h1>New Password</h1>
          <p>Enter your new password</p>
          <div className={Styles.subcon}>
            <img src={assets.lock_icon} alt="" />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <button className={Styles.btn}>Reset Password</button>
        </form>
      )}
    </div>
  );
};

export default ResetPassword;
