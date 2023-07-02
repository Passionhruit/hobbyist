import React, { useState } from "react";
import {
  getAuth,
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import {
  Input,
  ModalContainer,
  ModalContainerModal2,
  CancelBtn,
  SubmitBtn,
  TopButton,
  StH2,
  VerifyMessage,
  CheckId,
} from "./styledcomponents/Styled";

import {
  collection,
  addDoc,
  getFirestore,
  query,
  where,
  getDocs,
} from "firebase/firestore";

function SignUp() {
  const [isModalOpen2, setIsModalOpen2] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verifypassword, setVerifyPassword] = useState("");
  const [nickname, setNickName] = useState("");
  const [join, setJoin] = useState("회원가입");
  const [passwordverify, setPasswordVerify] = useState(true);
  const [isNicknameAvailable] = useState(true);

  const auth = getAuth();
  const navigate = useNavigate();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      return !auth.currentUser ? setJoin("회원가입") : setJoin("마이페이지");
    });
  }, [auth]);

  const emailChangeHandler = (event) => {
    setEmail(event.target.value);
  };

  const passwordChangeHandler = (event) => {
    setPassword(event.target.value);
    setPasswordVerify(
      event.target.value.length < 8 && event.target.value.length !== 0
    );
  };

  const SignUpBtnHandler = () => {
    setIsModalOpen2(true);
  };

  const CancelBtnHandler = () => {
    setIsModalOpen2(false);
    setEmail("");
    setPassword("");
    setVerifyPassword("");
    setPasswordVerify(true);
    setNickName("");
  };

  //회원가입 버튼 핸들러
  const SubmitBtnHandler = async (event) => {
    event.preventDefault();
    if (
      email.trim() === "" ||
      password.trim() === "" ||
      verifypassword.trim() === ""
    ) {
      alert("양식을 전부 입력해 주세요!");
      return;
    }
    if (password !== verifypassword) {
      alert("비밀번호가 일치하지 않습니다!");
      return;
    }
    if (password.length < 8) {
      alert("비밀번호는 8자리 이상이어야 합니다!");
      return;
    }

    try {
      const db = getFirestore();
      const usersCollectionRef = collection(db, "users");
      const querySnapshot = await getDocs(
        query(usersCollectionRef, where("nickname", "==", nickname))
      );

      if (!querySnapshot.empty) {
        alert("이미 사용 중인 닉네임입니다.");
        return;
      }

      //이메일 패스워드 받아서 회원가입 하는 코드
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      //가입 성공 시 alert 메세지 디스플레이 및 입력 필드 초기화와 모달창 닫기
      alert("가입에 성공했습니다!");

      const uid = userCredential.user.uid;

      await addDoc(collection(db, "users"), {
        uid: uid,
        email: email,
        nickname: nickname,
        memo: "자기소개를 입력해주세요.",
        img: "https://ca.slack-edge.com/T043597JK8V-U057B2LN1NU-f07fd31753d9-512",
      });

      setIsModalOpen2(false);
      setEmail("");
      setPassword("");
      setVerifyPassword("");
      setNickName("");
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        alert("이미 누군가 사용중인 이메일입니다.");
      } else {
        alert("가입에 실패했습니다!");
        console.log("가입 실패", error.code, error.message);
      }
    }
  };

  const verifypasswordChangeHandler = (event) => {
    setVerifyPassword(event.target.value);
  };

  const nicknameChangeHandler = (event) => {
    setNickName(event.target.value);
  };

  const verifyEmailHandler = async (event) => {
    event.preventDefault();
    if (email.trim() === "") {
      alert("이메일을 입력해 주세요!");
      return;
    }
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      if (methods.length > 0) {
        // 이미 존재하는 이메일
        alert("이미 존재하는 이메일입니다.");
      } else {
        // 사용 가능한 이메일
        alert("사용할 수 있는 이메일입니다!");
      }
    } catch (error) {
      alert("이메일 확인에 실패했습니다!");
      console.log("이메일 확인 실패", error.code, error.message);
    }
  };

  const verifyNicknameHandler = async (event) => {
    event.preventDefault();
    if (nickname.trim() === "") {
      alert("닉네임을 입력해 주세요!");
      return;
    }
    try {
      const db = getFirestore();
      const usersCollectionRef = collection(db, "users");
      const q = query(usersCollectionRef, where("nickname", "==", nickname));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // 이미 존재하는 닉네임입니다
        alert("이미 존재하는 닉네임입니다.");
      } else {
        // 사용 가능한 닉네임
        alert("사용할 수 있는 닉네임입니다!");
      }
    } catch (error) {
      alert("닉네임 확인에 실패했습니다!");
      console.log("닉네임 확인 실패", error);
    }
  };

  const navigateToMyPage = () => {
    navigate(`/mypage/${auth.currentUser.uid}`);
  };

  return (
    <>
      <TopButton
        className="Sign-Up-Btn"
        onClick={
          join === "회원가입"
            ? SignUpBtnHandler
            : () => {
                navigateToMyPage();
              }
        }
      >
        {join}
      </TopButton>
      {isModalOpen2 && (
        <ModalContainer className="Modal-Container">
          <ModalContainerModal2 className="Modal-Container-Modal2">
            <form className="Sign-Up" style={{ textAlign: "center" }}>
              <StH2>Sign Up</StH2>
              <Input
                className="Email-Input"
                type="text"
                value={email}
                onChange={emailChangeHandler}
                placeholder="아이디 (이메일 주소)"
              />
              <CheckId onClick={verifyEmailHandler}>중복확인</CheckId>
              <p>
                <Input
                  className="Password-Input"
                  type="password"
                  value={password}
                  onChange={passwordChangeHandler}
                  placeholder="비밀번호"
                />
                <br />
                {passwordverify && password && (
                  <VerifyMessage invalid={passwordverify ? "true" : undefined}>
                    비밀번호가 8자리 미만입니다.
                  </VerifyMessage>
                )}
                {!passwordverify && password && (
                  <VerifyMessage>8자리 이상입니다.</VerifyMessage>
                )}
              </p>
              <p>
                <Input
                  className="Verify-Password-Input"
                  type="password"
                  value={verifypassword}
                  onChange={verifypasswordChangeHandler}
                  placeholder="비밀번호 확인"
                />
              </p>

              <p>
                <Input
                  className="Nickname-Input"
                  type="text"
                  value={nickname}
                  onChange={nicknameChangeHandler}
                  placeholder="닉네임"
                />
                <CheckId onClick={verifyNicknameHandler}>중복확인</CheckId>
                {!isNicknameAvailable && (
                  <VerifyMessage
                    invalid={!isNicknameAvailable ? "true" : undefined}
                  >
                    이미 사용 중인 닉네임입니다.
                  </VerifyMessage>
                )}
              </p>
              <CancelBtn onClick={CancelBtnHandler}>x</CancelBtn>
              <SubmitBtn onClick={SubmitBtnHandler}>가입하기</SubmitBtn>
            </form>
          </ModalContainerModal2>
        </ModalContainer>
      )}
    </>
  );
}

export default SignUp;
