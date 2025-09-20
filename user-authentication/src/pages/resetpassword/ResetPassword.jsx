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
  const [otp, setOtp] = useState('');
  const [isOtpSubmitted, setIsOtpSubmitted] = useState(false);

  const { backendUrl } = useContext(AppContext);
  axios.defaults.withCredentials = true;

  const inputRefs = useRef([]);
  const navigate = useNavigate();

  const handleInput = (e, index) => {
    const value = e.target.value;
    if (value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').slice(0, 6);
    paste.split('').forEach((char, index) => {
      if (inputRefs.current[index]) inputRefs.current[index].value = char;
    });
  };

  // Step 1: Submit Email
  const onSubmitEmail = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/send-reset-otp`, { email });
      if (data.status) {
        toast.success(data.message);
        setIsEmailSent(true);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to send OTP');
    }
  };

  // Step 2: Verify OTP
  const onSubmitOtp = async (e) => {
    e.preventDefault();
    const enteredOtp = inputRefs.current.map((el) => el?.value || '').join('').trim();
    if (enteredOtp.length !== 6) return toast.error('Please enter all 6 digits');

    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/verify-reset-otp`, { email, otp: enteredOtp });
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
      const { data } = await axios.post(`${backendUrl}/api/auth/reset-password`, { email, otp, newPassword });
      if (data.status) {
        toast.success(data.message);
        navigate('/login');
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to reset password');
    }
  };

  return (
    <div className={Styles.container}>
      <img
        onClick={() => navigate('/')}
        src={assets.logo}
        alt="loginlogo"
        className={Styles.logo}
      />

      {/* Step 1: Enter Email */}
      {!isEmailSent && (
        <form onSubmit={onSubmitEmail} className={Styles.form}>
          <h1>Reset password</h1>
          <p className={Styles.pt}>Enter your registered email address</p>
          <div className={Styles.subcon}>
            <img src={assets.mail_icon} alt="" />
            <input
              className={Styles.int}
              type="email"
              placeholder="Email id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button className={Styles.btn}>Submit</button>
        </form>
      )}

      {/* Step 2: Enter OTP */}
      {!isOtpSubmitted && isEmailSent && (
        <form onSubmit={onSubmitOtp} className={Styles.form} onPaste={handlePaste}>
          <h1>Reset password OTP</h1>
          <p className={Styles.pt}>Enter the 6-digit code sent to your email id.</p>
          <div className={Styles.subcon2}>
            {Array(6).fill(0).map((_, index) => (
              <input
                className={Styles.in}
                type="text"
                maxLength="1"
                key={index}
                required
                ref={(el) => (inputRefs.current[index] = el)}
                onInput={(e) => handleInput(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
              />
            ))}
          </div>
          <button className={Styles.btn}>Submit</button>
        </form>
      )}

      {/* Step 3: Enter New Password */}
      {isOtpSubmitted && isEmailSent && (
        <form onSubmit={onSubmitNewPassword} className={Styles.form}>
          <h1>New password</h1>
          <p className={Styles.pt}>Enter the new password below</p>
          <div className={Styles.subcon}>
            <img src={assets.lock_icon} alt="" />
            <input
              className={Styles.int}
              type="password"
              placeholder="Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <button className={Styles.btn}>Submit</button>
        </form>
      )}
    </div>
  );
};

export default ResetPassword;
