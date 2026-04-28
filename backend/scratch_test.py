import text2qti.config
import text2qti.quiz
import text2qti.qti

md_content = """
1. Question Text
a) choice 1
*b) choice 2
"""
with open("test.md", "w") as f:
    f.write(md_content)

print("Testing text2qti...")
try:
    config = text2qti.config.Config()
    quiz = text2qti.quiz.Quiz(md_content, config=config, source_path="test.md")
    qti = text2qti.qti.QTI(quiz)
    qti.save("test.zip")
    print("SUCCESS 1: string content")
except Exception as e:
    print("FAILED 1:")
    import traceback
    traceback.print_exc()

print("\n---")
try:
    with open('test2.md', 'w') as f:
        f.write("1. Question\na) choice\n*b) choice")
    config = text2qti.config.Config()
    config.load() # try loading default?
    
    # how does text2qti CLI use it? Let's try what I wrote in main.py but passing string content
    quiz2 = text2qti.quiz.Quiz(md_content, config=config)
    qti2 = text2qti.qti.QTI(quiz2)
    qti2.save("test2.zip")
    print("SUCCESS 2: content only")
except Exception:
    import traceback
    traceback.print_exc()
