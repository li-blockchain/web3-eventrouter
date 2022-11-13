import UserButton from "./UserButton"


const SectionTop = () => {
    return (
      <div className="flex justify-end border-solid border-y-2 border-y-zinc-200">
        <div className="mx-10 my-4">
          <UserButton/>
        </div>
      </div>
    )
}

export default SectionTop;