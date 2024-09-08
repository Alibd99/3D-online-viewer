import bpy
import random

def create_random_color_ball():
    # Clear existing objects
    bpy.ops.wm.read_factory_settings(use_empty=True)

    # Create a new UV Sphere mesh
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1, location=(0, 0, 0))

    # Add a Subdivision Surface modifier to the sphere
    bpy.ops.object.modifier_add(type='SUBSURF')
    bpy.context.object.modifiers["Subdivision"].levels = 2

    # Smooth shading
    bpy.ops.object.shade_smooth()

    # Create a new material
    random_color_material = bpy.data.materials.new(name="RandomColorMaterial")
    random_color_material.use_nodes = True
    bsdf = random_color_material.node_tree.nodes.get("Principled BSDF")

    # Generate random color
    random_color = (random.random(), random.random(), random.random(), 1)  # Random RGBA color
    bsdf.inputs['Base Color'].default_value = random_color
    bsdf.inputs['Roughness'].default_value = 0.5  # Roughness value, you can adjust as needed

    # Assign the material to the sphere
    sphere = bpy.context.object
    if sphere.data.materials:
        sphere.data.materials[0] = random_color_material
    else:
        sphere.data.materials.append(random_color_material)

def perform_operations():
    create_random_color_ball()

    # Export the scene to GLTF
    export_path = "/home/alosh/projects1/exam/public/models/model.glb"
    
    try:
        bpy.ops.export_scene.gltf(filepath=export_path, export_format='GLB')
        print(f"Exported scene to {export_path}")
    except Exception as e:
        print(f"Error during export: {e}")
        return False

    return True  # Indicate success

if __name__ == "__main__":
    result = perform_operations()
    if not result:
        print("Export failed")