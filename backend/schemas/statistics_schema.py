from pydantic import BaseModel

class QuizStatistics(BaseModel):
    total_quizzes: int
    media_percentagem_acertos: float