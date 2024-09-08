import bpy
import random

def create_random_color_cube():
    # Create a cube
    bpy.ops.mesh.primitive_cube_add(size=2, location=(0, 0, 0))
    cube = bpy.context.active_object

    # Create a new material with a random color
    mat = bpy.data.materials.new(name="RandomColorMaterial")
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        random_color = (random.random(), random.random(), random.random(), 1)  # Random RGBA color
        bsdf.inputs['Base Color'].default_value = random_color
        bsdf.inputs['Roughness'].default_value = 0.5  # Roughness value, you can adjust as needed

    # Assign the material to the cube
    if cube.data.materials:
        cube.data.materials[0] = mat
    else:
        cube.data.materials.append(mat)

def export_scene(export_path):
    try:
        bpy.ops.export_scene.gltf(filepath=export_path, export_format='GLB')
        print(f"Exported scene to {export_path}")
        return True
    except Exception as e:
        print(f"Error during export: {e}")
        return False

def perform_operations():
    create_random_color_cube()
    export_path = "/home/alosh/projects1/exam/public/models/model.glb"
    return export_scene(export_path)

if __name__ == "__main__":
    result = perform_operations()
    if not result:
        print("Export failed")