import React, {useState, useRef, useEffect} from 'react'
import styled, {keyframes} from 'styled-components';
import Image from 'next/image';
import { useStateContext } from '../context/StateContext';
import KSquestionABI from "../contracts/KSquestionNFT.json"
import {ethers, BigNumber} from "ethers";
import { useRouter } from 'next/router'
import SearchIcon from '../assets/SearchIcon.png'
import TopicSelector from '../components/Utils/TopicSelector';

const Learn = () => {
  
  const router = useRouter()
  const { accounts , isActive, questionToBeViewed, onLoad, userKStokenCount, 
    setQuestionToBeViewed, KSquestionNFTContractAddress} = useStateContext();
  const [ totalQuestions, setTotalQuestions] = useState([]);
  const [ questions, setQuestions] = useState([]);

  const [titleSearch, setTitleSearchTerm] = useState("");
  const [topic, setTopic] = useState([]);

  function ViewQuestion(question){
    setQuestionToBeViewed(question)
    router.push(`/question/${question.questionID}`)
  }

  async function VeiwAllQuestions(){
    if(accounts[0]){
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const KSquestionsContract = await new ethers.Contract(
      KSquestionNFTContractAddress,
      KSquestionABI.abi,
      provider
    )
    let response;
    response = await KSquestionsContract.getAllQuestions()
    let finalResponses = []
    let i = 0;
    for(i=0;i<response.length;i++){
      
      const TokenURI = `https://${response[i]}.ipfs.w3s.link/question.json`;
      const tokenURIResponse = await fetch(TokenURI)
        .then(res => res.json())
        .then(data => { return data})

      finalResponses.push(tokenURIResponse)

      // SYSTEM OF WHEN SOMETHING GOES TO LEARN
      // if(isActive(tokenURIResponse.timeStamp, tokenURIResponse.bounty) == false){
      //   finalResponses.push(tokenURIResponse)
      // }
    }
    setQuestions(finalResponses);
    setTotalQuestions(finalResponses);
    }
  }

  useEffect(() => {
    VeiwAllQuestions()
    onLoad()
    setInterval(function() {
      VeiwAllQuestions()
      onLoad()
    }, 60000);
  }, [accounts[0]])

  // Searching Functionalties

  useEffect(() => {
    Search()
  }, [titleSearch, topic])

  function Search(){

    if(titleSearch.length >= 1 && topic.length != 0){
      let finalQuestions = []
      let newQuestions = [];
        let i = 0;
        for(i=0;i<totalQuestions.length;i++){
          if(searchedFor(totalQuestions[i].title, titleSearch)){
            newQuestions.push(totalQuestions[i])
          }
        }
        i = 0;
        for(i=0;i<newQuestions.length;i++){
            if(isASelectedTopic(newQuestions[i].topic)){
              finalQuestions.push(newQuestions[i])
            }
          }
          setQuestions(finalQuestions) 
  }

    if(titleSearch.length >= 1 && topic.length == 0){
    let newQuestions = [];
    let i = 0;
    for(i=0;i<totalQuestions.length;i++){
      if(searchedFor(totalQuestions[i].title, titleSearch)){
        newQuestions.push(totalQuestions[i])
      }
    }
      setQuestions(newQuestions) 
  }

    if(titleSearch.length == 0 && topic.length != 0){
    let newQuestions = [];
    let i = 0;
    for(i=0;i<totalQuestions.length;i++){
      if(isASelectedTopic(totalQuestions[i].topic)){
        newQuestions.push(totalQuestions[i])
      }
    }
      setQuestions(newQuestions) 
  }
  
    if( titleSearch.length == 0&& topic.length == 0){
    setQuestions(totalQuestions)
  }

  }

  function searchedFor(questionText, string){
    return Boolean(String(questionText.toLowerCase()).indexOf(string.toLowerCase()) >= 0)
  }

  function isASelectedTopic(toBeChecked){
    let i = 0;
    for(i=0;i<topic.length;i++){
      if(toBeChecked == topic[i]){
        return true;
      }
    }
    return false;
  }


  return (
    <>
    <NewSection>

      <NewContainer>
        <TitleContainer>Explore Inquiries</TitleContainer>
        <SearchBarsContainer>
          <Form>
            <Input onChange={e => setTitleSearchTerm(e.target.value)} value={titleSearch} placeholder= "Search by title....." />
            <IconContainer><Image src={SearchIcon} alt="search icon"/></IconContainer>
          </Form>
          <SecondForm>
            <TopicSelector topic={topic} setTopic={setTopic}/>
          </SecondForm>
        </SearchBarsContainer>

    <FilterContainer>
      <QuestionText>Learn</QuestionText>
      <ThreadInfo>
        <FilterInfo>Topic</FilterInfo>
      </ThreadInfo>
    </FilterContainer>

      {accounts[0] ? <>

      {userKStokenCount >= 1000 ?
      <ThreadContainer>
      {[...questions].reverse()?.map((question) => 
        <ThreadDiv onClick={() => ViewQuestion(question)} key={question.id}>
        <ThreadContent>
          <ThreadText>
          {question.description ? 
                      <><ThreadTitle >{question.title}</ThreadTitle>
                      <ThreadDesc>{question.description}</ThreadDesc> </>
                      :<ThreadTitle2>{question.title}</ThreadTitle2>}
          </ThreadText>
          <ThreadInfo>
            <TopicDiv>{question.topic}</TopicDiv>
          </ThreadInfo>
        </ThreadContent>
      </ThreadDiv>
      )}
      </ThreadContainer> : <Marginer>
      <MinimumHold>Must hold at least 1000 KS tokens to learn</MinimumHold>
      </Marginer> }
      </> 
      : 
      <Marginer>
        <WalletPlease>Please Connect Wallet</WalletPlease>
        </Marginer>}

      </NewContainer>
    </NewSection>

</>
  )
}
const IconContainer = styled.div`
display: flex;
margin-right: auto;
margin: 0vw 1vw;
img{
width: 2vw;
height: 2vw;
&:hover{
  cursor: pointer;
  transform: scale(1.05);
}
}
`
const WalletPlease = styled.div`
font-size: ${props => props.theme.fontSubheading_large};
font-weight: ${props => props.theme.fontBold};
text-align: center;
`
const MinimumHold = styled.div`
font-size: ${props => props.theme.fontSubheading_small};
font-weight: ${props => props.theme.fontBold};
text-align: center;
`
const Marginer = styled.div`
  margin-top: 3vw;
  margin-bottom: 3vw;
`
const NewSection = styled.div`
display: flex;
justify-content: center;
`
const NewContainer = styled.div`
width: 97%;
margin-bottom: 4vw;
flex-direction: column;
`
const SearchBarsContainer = styled.div`
width: 100%;
display: flex;
justify-content: space-between;
min-height: 8vw;
align-items: center;
`
const TitleContainer = styled.div`
width: 100%;
margin-top: 2vw;
display: flex;
justify-content: center;
align-items: center;
color: ${props => props.theme.textColor};
font-size: ${props => props.theme.fontTitle_default};
font-weight: ${props => props.theme.fontBold};
`
const Form = styled.div`
display: flex;
color: ${props => props.theme.textColor};
background-color: gainsboro;
align-items: center;
height: 3.5vw;
`
const Input = styled.input`
font-size: ${props => props.theme.fontParagraph_medium};
background-color: transparent;
width: 60vw;
margin-left: 1vw;
border: none;
color: ${props => props.theme.textColor};
&:focus,
&:active {
  outline: none;
}
&::placeholder {
  color: ${props => props.theme.textColor};
}
`
const SecondForm = styled.div`
display: flex;
justify-content: center;
min-height: 1.5vw;
height: 100%;
width: 30%;
margin-bottom: 1vw;
margin-top: 1vw;
color: ${props => props.theme.textColor};
align-items: center;
`
const FilterContainer = styled.div`
display: flex;
height: 5vw;
width: 100%;
align-items: center;
background-color: ${props => props.theme.textColor};
color: ${props => props.theme.backgroundColor};
`
const QuestionText = styled.div`
font-size: ${props => props.theme.fontParagraph_large};
margin-right: auto;
margin-left: 2.5%;
font-weight: ${props => props.theme.fontBold};
`
const ThreadContainer = styled.div`
width: 100%;
flex-direction: column;
`
const ThreadDiv = styled.div`
display: flex;
width: 100%;
height: 10vw;
align-items: center;
box-shadow: 0.5vw 0.5vw 1vw gainsboro;

&:hover{
  box-shadow: none;
  background-color: azure;
  cursor: pointer;
}
`
const ThreadContent = styled.div`
display: flex;
width: 100%;
margin-left: 2.5%;
height: 80%;
align-items: center;
`
const ThreadInfo = styled.div`
display: flex;
width: 8vw;
justify-content: center;
align-items: center;
margin-left: auto;
margin-right: 2.5%;
`
const TopicDiv = styled.div`
display: flex;
font-size: ${props => props.theme.fontParagraph_small};
font-weight: ${props => props.theme.fontBold};
justify-content: center;
align-items: center;
background-color: gainsboro;
color: black;
width: 6vw;
height: 2.5vw;
text-align: center;
`
const FilterInfo = styled.div`
font-size: ${props => props.theme.fontParagraph_small};
font-weight: ${props => props.theme.fontBold};
color: ${props => props.theme.backgroundColor};
`
const ThreadText = styled.div`
display: flex;
font-weight: ${props => props.theme.fontBold};
width: 50vw;
height: 90%;
flex-direction: column;
`

const ThreadTitle = styled.text`
font-size: ${props => props.theme.fontParagraph_large};
font-weight: ${props => props.theme.fontBold};
white-space: nowrap;
overflow: hidden;
text-overflow: ellipsis;
`
const ThreadTitle2 = styled.text`
font-size: ${props => props.theme.fontParagraph_large};
font-weight: ${props => props.theme.fontBold};
display: -webkit-box;
-webkit-line-clamp: 3;
-webkit-box-orient: vertical;
overflow: hidden;
text-overflow: ellipsis;
`

const ThreadDesc = styled.text`
font-size: ${props => props.theme.fontParagraph_medium};
height: 3.5vw;
margin: auto 0;
font-weight: ${props => props.theme.fontLight};
overflow: hidden;
text-align: justify;
display: -webkit-box;
-webkit-line-clamp: 2;
-webkit-box-orient: vertical;
`
export default Learn