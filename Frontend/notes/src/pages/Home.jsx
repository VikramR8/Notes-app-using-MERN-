import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar/Navbar'
import NoteCard from '../components/Cards/NoteCard'
import { MdAdd } from 'react-icons/md'
import AddEditNotes from '../components/Cards/AddEditNotes'
import Modal from 'react-modal'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../utils/axiosInstance'
import ToastMessage from '../components/ToastMessage/ToastMessage'
import EmptyCard from '../components/ToastMessage/EmptyCard'
import AddNotesImg from "../assets/images/add-note.svg"
import NoData from "../assets/images/no-data.svg"

const Home = () => {

  const[showToastMsg,setShowToastMsg]=useState({
    isShown:false,
    type:"add",
    data:null,
  })

  const [openAddEditModal,setOpenAddEditModal]=useState({
    isShown:false,
    type:"add",
    data:null
  })
  const [allNotes,setAllNotes]=useState([])
  const [userInfo,setUserInfo]=useState(null)
  const [isSearch,setIsSearch]=useState(false)

  const navigate=useNavigate()

  const handleEdit=(noteDetails)=>{
    setOpenAddEditModal({isShown:true, data:noteDetails, type:"edit"})
  }
  const showToastMessage=(message,type)=>{
    setShowToastMsg({
      isShown:true,
      message,
      type,
    })
  }

  const handleCloseToast=()=>{
    setShowToastMsg({
      isShown:false,
      message:"",
    })
  }
//Get User Info
const getUserInfo=async()=>{
  try{
    const response=await axiosInstance.get("/getuser")
    if(response.data && response.data.user)
    {
      setUserInfo(response.data.user)
    }
  }
  catch(error)
  {
    if(error.response.status===401)
    {
      localStorage.clear()
      navigate("/login")
    }
  }
}
//Get all notes
const getAllNotes= async()=>{
  const response=await axiosInstance.get("/getallnotes")
  try {
    if(response.data && response.data.notes)
    {
      setAllNotes(response.data.notes)
    }
  } catch (error) {
      console.log("An unexpected error occured. Please try again.")    
  }
}
//Delete Note
const deleteNote=async(data)=> {
  const noteId=data._id
    try {
      const response=await axiosInstance.delete(`/deletenote/${noteId}`)

      if(response.data && !response.data.error){
        showToastMessage("Note Deleted Successfully", 'delete')
        getAllNotes()
      }
    } catch (error) {
      if(error.response && error.response.data && error.response.data.message)
      {
        console.log("An unexpected error occured. Please try again.") 
      }
    }
}
//Search Note
const onSearchNote=async(query)=>{
  try{
    const response=await axiosInstance.get("/searchnote",{
      params:{query},
    })
    if(response.data && response.data.notes)
    {
      setIsSearch(true)
      setAllNotes(response.data.notes)
    }
  }
  catch(error)
  {
    console.log(error)
  }
}

const updateIsPinned=async(noteData)=>{
  const noteId=noteData._id
  try {
    const response=await axiosInstance.put(`/updatenotepin/${noteId}`,{
      isPinned:!noteData.isPinned,
    })

    if(response.data && response.data.note)
    {
      showToastMessage("Note Updated Successfully")
      getAllNotes()
    }

  } catch (error) {
    console.log(error)
  }
}

const handleClearSearch=()=>{
  setIsSearch(false)
  getAllNotes()
}
useEffect(()=>{
  getAllNotes()
  getUserInfo()
  return()=>{}
},[])

  return (
    <>
      <Navbar userInfo={userInfo} onSearchNote={onSearchNote } handleClearSearch={handleClearSearch} />
      <div className='container mx-auto'>
        {
          allNotes.length>0?(
      <div className='grid grid-cols-3 gap-4 mt-8 '>
        {allNotes.map((item,index)=>(
          <NoteCard
          key={item._id}
          title={item.title}
          date={item.createdOn}
          content={item.content}
          tags={item.tags}
          isPinned={item.isPinned}
          onEdit={()=>handleEdit(item)}
          onDelete={()=>deleteNote(item)}
          onPinNote={()=>updateIsPinned(item)}
        />
        ))}
      </div>
  ):(<EmptyCard 
    imgSrc={isSearch? NoData:AddNotesImg} 
    message={isSearch?`Oops!! No notes found matching your search. Create One!!`:`Start creating your first note! Click the 'Add' button to join down your thoughts, ideas and reminders. Let's get started!`}/>)}
      </div>

      <button className='w-16 h-16 flex items-center justify-center rounded-2xl bg-primary hover:bg-blue-600 absolute right-10 bottom-10' onClick={()=>{
        setOpenAddEditModal({isShown:true,type:"add",data:null})
      }}>
        <MdAdd className='text-[32px] text-white'/>
      </button>

      <Modal
      isOpen={openAddEditModal.isShown}
      onRequestClose={()=>{}}
      style={{
        overlay:{
          backgroundColor:"rgba(0,0,0,0.2)",
        },
      }}
      contentLabel=""
      className="w-[40%] max-h-3/4 bg-white rounded-md mx-auto mt-14 p-5 ">

      <AddEditNotes
      type={openAddEditModal.type} 
      noteData={openAddEditModal.data} 
      onClose={()=>{
        setOpenAddEditModal({isShown:false,type:"add",data:null})
      }}
      getAllNotes={getAllNotes}
      showToastMessage={showToastMessage}
      />
      </Modal>

      <ToastMessage
      isShown={showToastMsg.isShown}
      message={showToastMsg.message}
      type={showToastMsg.type}
      onClose={handleCloseToast}
      />
    </>
  )
}

export default Home
