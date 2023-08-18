# Read the content from the file
with open("animalfarm.txt", "r") as file:
    content = file.read()

# Make changes to the content (for example, replace "old" with "new")
modified_content = content.replace("Mr.", "Mr")

# Save the modified content back to the file
with open("animalfarm.txt", "w") as file:
    file.write(modified_content)

print("File has been modified and saved.")