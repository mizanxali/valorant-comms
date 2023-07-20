import { Badge, Button, Card, Image, Row, Text } from "@nextui-org/react";

interface IPlayerCardProps {
  index: number;
  isMe: boolean;
  playerID: string;
  isPlayerInMyParty: boolean;
  isPlayerSpeaking: boolean;
  joinPartyHandler: (playerID: string) => void;
  leavePartyHandler: () => void;
}

const playerImgs = [
  "https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/bltf0200e1821b5b39f/5eb7cdc144bf8261a04d87f9/V_AGENTS_587x900_Phx.png",
  "https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/bltf11234f4775729b7/5ebf2c275e73766852c8d5d4/V_AGENTS_587x900_ALL_Sova_2.png",
  "https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/bltc825c6589eda7717/5eb7cdc6ee88132a6f6cfc25/V_AGENTS_587x900_Viper.png",
  "https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/bltceaa6cf20d328bd5/5eb7cdc1b1f2e27c950d2aaa/V_AGENTS_587x900_Jett.png",
  "https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/blt53405c26141beff8/5f21fda671ec397ef9bf0894/V_AGENTS_587x900_KillJoy_.png",
];

export default function PlayerCard({
  isMe,
  isPlayerInMyParty,
  isPlayerSpeaking,
  playerID,
  index,
  joinPartyHandler,
  leavePartyHandler,
}: IPlayerCardProps) {
  return (
    <Card css={{ w: "100%", h: "400px", maxW: "300px" }}>
      <Card.Header css={{ position: "absolute", zIndex: 1, top: 5 }}>
        <Row justify="space-between">
          {isPlayerSpeaking && (
            <div>
              <svg
                width="28"
                height="25"
                viewBox="0 0 28 25"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18.4984 0.803431C18.0344 0.611431 17.46 0.675423 17.04 1.09542C16.1072 2.02742 14.9282 2.80077 13.5792 3.37944C12.2089 3.96611 9.39571 4.72476 7.34144 4.71143C3.34531 4.68476 0.664906 6.95009 0.665039 11.3368C0.665039 15.1808 2.84717 17.4168 5.98811 17.9194L5.99837 20.7008C5.99837 22.9074 7.78917 24.6968 9.99837 24.6968C12.0284 24.6968 13.7005 23.1261 13.9586 21.1621C13.971 21.0674 13.9984 20.7008 13.9984 19.3674C15.1961 19.9261 16.1885 20.8101 17.04 21.6608C17.88 22.4994 19.3317 21.8901 19.3317 20.7035C19.3317 19.4981 19.3253 17.3154 19.3253 15.1381C20.897 14.5568 21.9984 13.0674 21.9984 11.3781C21.9984 9.68876 20.9582 8.16079 19.3389 7.59412C19.3389 5.41679 19.3317 3.25811 19.3317 2.05278C19.3317 1.45945 18.9625 0.996764 18.4984 0.803431ZM21.7066 3.17676C21.3764 3.2621 21.1016 3.48479 20.915 3.80079C20.5421 4.43545 20.7384 5.26078 21.3733 5.63278C23.3996 6.82211 24.665 8.98743 24.665 11.3781C24.665 13.7701 23.401 15.9341 21.3733 17.1234C20.7382 17.4954 20.5008 18.3194 20.8733 18.9541C21.2461 19.5888 22.0714 19.7848 22.7066 19.4128C25.5422 17.7501 27.3316 14.7248 27.3317 11.3781C27.3317 8.03276 25.5401 5.00609 22.7066 3.34343C22.3892 3.15676 22.0369 3.09143 21.7066 3.17676ZM16.6712 4.74744C16.6712 5.98077 16.665 7.26611 16.665 8.71411C16.665 11.3781 16.665 11.3781 16.665 14.0421C16.665 15.4901 16.6693 16.7234 16.6693 17.9567C13.9689 16.3634 11.1848 15.6568 8.66784 15.4301C8.66784 13.3968 8.66104 9.37543 8.66104 7.28076C8.92237 7.26876 9.22637 7.23545 9.66504 7.17412C11.3676 6.93012 13.0592 6.48744 14.665 5.79944C15.4296 5.47278 15.9978 5.17677 16.6712 4.74744ZM5.99637 7.50476C5.99637 9.55276 5.99437 13.1714 5.99437 15.2194C4.25931 14.7394 3.33171 13.5141 3.33171 11.3368C3.33171 9.18475 4.16771 7.90876 5.99637 7.50476ZM8.66504 18.1221C9.08717 18.1368 10.6165 18.4088 11.3182 18.5861L11.3317 20.7008C11.3317 21.4368 10.7348 22.0328 9.99837 22.0328C9.26197 22.0328 8.66504 21.4368 8.66504 20.7008V18.1221Z"
                  fill="#ffffff"
                />
              </svg>
            </div>
          )}
          {isPlayerInMyParty && <Badge color="primary">In Party</Badge>}
        </Row>
      </Card.Header>
      <Card.Body css={{ p: 0, bgColor: "#16181A", border: "none" }}>
        <Card.Image
          src={playerImgs[index % 5]}
          width="100%"
          height="100%"
          objectFit="contain"
          alt="Card background"
        />
      </Card.Body>
      <Card.Footer
        isBlurred
        css={{
          position: "absolute",
          bgBlur: "#ffffff66",
          borderTop: "$borderWeights$light solid rgba(255, 255, 255, 0.2)",
          bottom: 0,
          zIndex: 1,
        }}
      >
        <Row align="center" justify="space-between">
          <div>
            <Text h1 weight="bold" size={"$xl"}>
              Player {index + 1} {isMe && "(You)"}
            </Text>
          </div>
          {!isMe &&
            (isPlayerInMyParty ? (
              <Button size="xs" color="error" onClick={leavePartyHandler}>
                Leave Party
              </Button>
            ) : (
              <Button
                size="xs"
                color="primary"
                onClick={() => joinPartyHandler(playerID)}
              >
                Join Party
              </Button>
            ))}
        </Row>
      </Card.Footer>
    </Card>
  );
}
