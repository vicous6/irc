export default function ChooseNicknameForm({ chooseName }) {
  return (
    <>
      <form
        id="chooseNickname"
        onSubmit={(e) => {
          e.preventDefault();
          chooseName(e.target[0].value);
        }}
      >
        <input placeholder="choose a nickname"></input>
        <button type="submit">Valider</button>
      </form>
    </>
  );
}
